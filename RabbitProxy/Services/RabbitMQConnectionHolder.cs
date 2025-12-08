using System;
using System.Collections.Concurrent;
using System.Threading;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using log4net;
using RabbitProxy.Models;

namespace RabbitProxy.Services
{
    public sealed class RabbitMQConnectionHolder : IDisposable
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(RabbitMQConnectionHolder));

        private readonly object _connectionLock = new object();
        private readonly ConcurrentDictionary<string, IModel> _channels = new ConcurrentDictionary<string, IModel>();

        private IConnection _connection;
        private RabbitConnectionParams _lastParameters;
        private volatile bool _disposed;

        private const int MaxRetryDelayMs = 60000;
        private const int InitialRetryDelayMs = 1000;

        public event Action<string> ChannelLost;

        public bool HasChannels
        {
            get { return !_channels.IsEmpty; }
        }

        public void EnsureConnected(RabbitConnectionParams parameters)
        {
            if (_disposed)
            {
                throw new ObjectDisposedException(nameof(RabbitMQConnectionHolder));
            }

            lock (_connectionLock)
            {
                _lastParameters = parameters;

                if (_connection != null && _connection.IsOpen)
                {
                    return;
                }

                int retryDelay = InitialRetryDelayMs;

                while (!_disposed)
                {
                    try
                    {
                        DisposeConnectionOnly();

                        var factory = new ConnectionFactory
                        {
                            HostName = parameters.ServerName,
                            Port = parameters.Port,
                            UserName = parameters.Username,
                            Password = parameters.Password,
                            VirtualHost = parameters.VirtualHost,
                            RequestedConnectionTimeout = TimeSpan.FromMilliseconds(parameters.Timeout),
                            AutomaticRecoveryEnabled = true,
                            NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
                            TopologyRecoveryEnabled = true,
                            Ssl = new SslOption
                            {
                                Enabled = parameters.SSLEnabled,
                                ServerName = parameters.ServerCN ?? parameters.ServerName,
                                Version = System.Security.Authentication.SslProtocols.Tls12
                            }
                        };

                        _connection = factory.CreateConnection();
                        _connection.ConnectionShutdown += OnConnectionShutdown;
                        _connection.CallbackException += OnCallbackException;

                        Log.Info("RabbitMQ connected successfully.");
                        return;
                    }
                    catch (Exception ex)
                    {
                        Log.Error("RabbitMQ connection failed. Retrying in " + retryDelay + "ms...", ex);
                        Thread.Sleep(retryDelay);
                        retryDelay = Math.Min(retryDelay * 2, MaxRetryDelayMs);
                    }
                }
            }
        }

        private void OnConnectionShutdown(object sender, ShutdownEventArgs e)
        {
            Log.Error("RabbitMQ connection shutdown: " + e.ReplyText + " (Initiator: " + e.Initiator + ")");

            if (e.Initiator == ShutdownInitiator.Application)
            {
                return;
            }

            foreach (var key in _channels.Keys)
            {
                IModel removed;
                _channels.TryRemove(key, out removed);
                RaiseChannelLost(key);
            }
        }

        private void OnCallbackException(object sender, CallbackExceptionEventArgs e)
        {
            Log.Error("RabbitMQ callback exception: " + e.Exception.Message, e.Exception);
        }

        private void RaiseChannelLost(string key)
        {
            try
            {
                Action<string> handler = ChannelLost;
                if (handler != null)
                {
                    handler(key);
                }
            }
            catch (Exception ex)
            {
                Log.Error("Error in ChannelLost handler", ex);
            }
        }

        public IModel GetOrCreateChannel(string key)
        {
            if (_disposed)
            {
                throw new ObjectDisposedException(nameof(RabbitMQConnectionHolder));
            }

            IModel existing;
            if (_channels.TryGetValue(key, out existing) && existing.IsOpen)
            {
                return existing;
            }

            lock (_connectionLock)
            {
                if (_channels.TryGetValue(key, out existing) && existing.IsOpen)
                {
                    return existing;
                }

                if (_channels.TryGetValue(key, out existing))
                {
                    _channels.TryRemove(key, out _);
                    SafeDisposeChannel(existing);
                }

                if (_connection == null || !_connection.IsOpen)
                {
                    throw new InvalidOperationException("Connection is not open. Call EnsureConnected first.");
                }

                var channel = _connection.CreateModel();

                channel.ModelShutdown += (s, e) =>
                {
                    Log.Error("Channel shutdown for key '" + key + "': " + e.ReplyText);
                    IModel removed;
                    _channels.TryRemove(key, out removed);
                    RaiseChannelLost(key);
                };

                _channels[key] = channel;
                return channel;
            }
        }

        public void RemoveChannel(string key)
        {
            IModel channel;
            if (_channels.TryRemove(key, out channel))
            {
                SafeDisposeChannel(channel);
            }
        }

        private void SafeDisposeChannel(IModel channel)
        {
            if (channel == null)
            {
                return;
            }

            try
            {
                if (channel.IsOpen)
                {
                    channel.Close();
                }
            }
            catch (Exception ex)
            {
                Log.Warn("Error closing channel", ex);
            }

            try
            {
                channel.Dispose();
            }
            catch (Exception ex)
            {
                Log.Warn("Error disposing channel", ex);
            }
        }

        private void DisposeConnectionOnly()
        {
            if (_connection == null)
            {
                return;
            }

            try
            {
                _connection.ConnectionShutdown -= OnConnectionShutdown;
                _connection.CallbackException -= OnCallbackException;
            }
            catch (Exception ex)
            {
                Log.Warn("Error unsubscribing connection events", ex);
            }

            try
            {
                if (_connection.IsOpen)
                {
                    _connection.Close();
                }
            }
            catch (Exception ex)
            {
                Log.Warn("Error closing connection", ex);
            }

            try
            {
                _connection.Dispose();
            }
            catch (Exception ex)
            {
                Log.Warn("Error disposing connection", ex);
            }

            _connection = null;
        }

        public void Dispose()
        {
            if (_disposed)
            {
                return;
            }

            _disposed = true;

            foreach (var kvp in _channels)
            {
                SafeDisposeChannel(kvp.Value);
            }

            _channels.Clear();
            DisposeConnectionOnly();
        }
    }
}
