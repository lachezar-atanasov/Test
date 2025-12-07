// File: RabbitProxy/Services/RabbitMQConnectionHolder.cs
using System;
using System.Collections.Concurrent;
using System.Threading;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using log4net;
using RabbitProxy.Models;

namespace RabbitProxy.Services
{
    /// <summary>
    /// Manages a long-lived RabbitMQ connection and channels.
    /// Thread-safe for concurrent channel access.
    /// </summary>
    public sealed class RabbitMQConnectionHolder : IDisposable
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(RabbitMQConnectionHolder));

        private IConnection _connection;
        private readonly ConcurrentDictionary<string, IModel> _channels = new ConcurrentDictionary<string, IModel>();
        private RabbitConnectionParams _lastParameters;
        private readonly object _connectionLock = new object();
        private volatile bool _disposed;

        /// <summary>
        /// Returns true if any channels are currently open.
        /// </summary>
        public bool HasChannels
        {
            get { return !_channels.IsEmpty; }
        }

        /// <summary>
        /// Returns true if the connection is open.
        /// </summary>
        public bool IsConnected
        {
            get
            {
                var conn = _connection;
                return conn != null && conn.IsOpen;
            }
        }

        /// <summary>
        /// Ensures a connection is established. Blocks until connected or max retries exceeded.
        /// </summary>
        /// <param name="parameters">Connection parameters.</param>
        /// <exception cref="InvalidOperationException">Thrown if max retries exceeded.</exception>
        public void EnsureConnected(RabbitConnectionParams parameters)
        {
            if (_disposed)
                throw new ObjectDisposedException(GetType().Name);

            parameters.Validate();
            _lastParameters = parameters;

            lock (_connectionLock)
            {
                if (_connection != null && _connection.IsOpen)
                    return;

                int attempts = 0;
                int maxRetries = parameters.MaxConnectionRetries > 0 ? parameters.MaxConnectionRetries : int.MaxValue;

                while (attempts < maxRetries)
                {
                    attempts++;

                    try
                    {
                        DisposeConnectionOnly();

                        var factory = CreateConnectionFactory(parameters);
                        _connection = factory.CreateConnection();
                        _connection.ConnectionShutdown += OnConnectionShutdown;

                        Log.Info(string.Format("RabbitMQ connected to {0}:{1} (attempt {2})",
                            parameters.ServerName, parameters.Port, attempts));
                        return;
                    }
                    catch (Exception ex)
                    {
                        Log.Error(string.Format(
                            "RabbitMQ connection failed (attempt {0}/{1}). Retrying in {2}ms...",
                            attempts, maxRetries, parameters.RetryDelayMs), ex);

                        if (attempts >= maxRetries)
                        {
                            throw new InvalidOperationException(
                                string.Format("Failed to connect to RabbitMQ after {0} attempts", maxRetries), ex);
                        }

                        Thread.Sleep(parameters.RetryDelayMs);
                    }
                }
            }
        }

        private ConnectionFactory CreateConnectionFactory(RabbitConnectionParams parameters)
        {
            var factory = new ConnectionFactory
            {
                HostName = parameters.ServerName,
                Port = parameters.Port,
                UserName = parameters.Username,
                Password = parameters.Password,
                VirtualHost = parameters.VirtualHost ?? "/",
                // RabbitMQ.Client 5.x uses int (milliseconds) for timeout
                RequestedConnectionTimeout = parameters.Timeout,
                // Let RabbitMQ client handle automatic recovery
                AutomaticRecoveryEnabled = true,
                NetworkRecoveryInterval = TimeSpan.FromSeconds(5),
                TopologyRecoveryEnabled = true
            };

            if (parameters.SSLEnabled)
            {
                factory.Ssl = new SslOption
                {
                    Enabled = true,
                    ServerName = parameters.ServerCN ?? parameters.ServerName,
                    // TLS 1.2 for secure connections
                    Version = System.Security.Authentication.SslProtocols.Tls12
                };
            }

            return factory;
        }

        private void OnConnectionShutdown(object sender, ShutdownEventArgs e)
        {
            // Only log here; automatic recovery will handle reconnection
            Log.Warn(string.Format("RabbitMQ connection shutdown: {0} (Code: {1})",
                e.ReplyText, e.ReplyCode));
        }

        /// <summary>
        /// Gets an existing channel by key, or creates a new one.
        /// Channels are lightweight and cheap to create.
        /// </summary>
        /// <param name="key">Unique key to identify the channel.</param>
        /// <returns>An open channel.</returns>
        public IModel GetOrCreateChannel(string key)
        {
            if (_disposed)
                throw new ObjectDisposedException(GetType().Name);

            if (string.IsNullOrEmpty(key))
                throw new ArgumentException("Channel key is required", "key");

            // Try to get existing channel
            IModel existing;
            if (_channels.TryGetValue(key, out existing) && existing != null && existing.IsOpen)
            {
                return existing;
            }

            // Need to create or replace channel
            lock (_connectionLock)
            {
                // Double-check after acquiring lock
                if (_channels.TryGetValue(key, out existing) && existing != null && existing.IsOpen)
                {
                    return existing;
                }

                // Remove stale channel if present
                if (existing != null)
                {
                    IModel removed;
                    _channels.TryRemove(key, out removed);
                    SafeDisposeChannel(existing);
                }

                if (_connection == null || !_connection.IsOpen)
                {
                    throw new InvalidOperationException(
                        "Connection is not open. Call EnsureConnected first.");
                }

                IModel newChannel = _connection.CreateModel();

                newChannel.ModelShutdown += (s, e) =>
                {
                    Log.Warn(string.Format("Channel '{0}' shutdown: {1}", key, e.ReplyText));
                    // Don't remove from dictionary here - let GetOrCreateChannel handle it
                };

                _channels[key] = newChannel;

                Log.Debug(string.Format("Created channel: {0}", key));
                return newChannel;
            }
        }

        /// <summary>
        /// Removes and disposes a channel by key.
        /// </summary>
        /// <param name="key">Channel key.</param>
        public void RemoveChannel(string key)
        {
            IModel channel;
            if (_channels.TryRemove(key, out channel))
            {
                SafeDisposeChannel(channel);
                Log.Debug(string.Format("Removed channel: {0}", key));
            }
        }

        private void SafeDisposeChannel(IModel channel)
        {
            if (channel == null)
                return;

            try
            {
                if (channel.IsOpen)
                {
                    channel.Close();
                }
            }
            catch (Exception ex)
            {
                Log.Debug("Error closing channel: " + ex.Message);
            }

            try
            {
                channel.Dispose();
            }
            catch (Exception ex)
            {
                Log.Debug("Error disposing channel: " + ex.Message);
            }
        }

        private void DisposeConnectionOnly()
        {
            var conn = _connection;
            _connection = null;

            if (conn != null)
            {
                try
                {
                    conn.ConnectionShutdown -= OnConnectionShutdown;
                }
                catch { }

                try
                {
                    if (conn.IsOpen)
                    {
                        // RabbitMQ.Client 5.x uses int (milliseconds) for close timeout
                        conn.Close(5000);
                    }
                }
                catch { }

                try
                {
                    conn.Dispose();
                }
                catch { }
            }
        }

        /// <summary>
        /// Disposes all channels and the connection.
        /// </summary>
        public void Dispose()
        {
            if (_disposed)
                return;

            _disposed = true;

            // Close all channels first
            foreach (var kvp in _channels)
            {
                SafeDisposeChannel(kvp.Value);
            }
            _channels.Clear();

            // Then close connection
            lock (_connectionLock)
            {
                DisposeConnectionOnly();
            }

            Log.Debug("RabbitMQConnectionHolder disposed");
        }
    }
}
