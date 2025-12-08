using System;
using System.Text;
using System.Threading;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using log4net;
using RabbitProxy.Models;
using RabbitProxy.Interfaces;

namespace RabbitProxy.Services
{
    public class RabbitMessageReceiverService : IRabbitMessageReceiverService, IDisposable
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(RabbitMessageReceiverService));

        private readonly object _lock = new object();
        private IConnection _connection;
        private IModel _channel;
        private EventingBasicConsumer _consumer;
        private RabbitConnectionParams _parameters;
        private Action<string, IModel, ulong> _handler;
        private volatile bool _stopped;

        public void StartConsuming(RabbitConnectionParams parameters, Action<string, IModel, ulong> handleMessage)
        {
            lock (_lock)
            {
                _parameters = parameters;
                _handler = handleMessage;
                _stopped = false;
                Connect();
            }
        }

        private void Connect()
        {
            int delay = 1000;

            while (!_stopped)
            {
                try
                {
                    Cleanup();

                    var factory = new ConnectionFactory
                    {
                        HostName = _parameters.ServerName,
                        Port = _parameters.Port,
                        UserName = _parameters.Username,
                        Password = _parameters.Password,
                        VirtualHost = _parameters.VirtualHost,
                        RequestedConnectionTimeout = TimeSpan.FromMilliseconds(_parameters.Timeout),
                        AutomaticRecoveryEnabled = true,
                        NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
                        Ssl = new SslOption
                        {
                            Enabled = _parameters.SSLEnabled,
                            ServerName = _parameters.ServerCN ?? _parameters.ServerName,
                            Version = System.Security.Authentication.SslProtocols.Tls12
                        }
                    };

                    _connection = factory.CreateConnection();
                    _connection.ConnectionShutdown += OnConnectionShutdown;
                    _connection.CallbackException += OnCallbackException;

                    _channel = _connection.CreateModel();
                    _channel.ModelShutdown += OnChannelShutdown;
                    _channel.BasicQos(0, 1, false);
                    _channel.QueueDeclarePassive(_parameters.QueueName);

                    _consumer = new EventingBasicConsumer(_channel);
                    _consumer.Received += OnMessageReceived;
                    _consumer.Shutdown += OnConsumerShutdown;

                    _channel.BasicConsume(_parameters.QueueName, false, _consumer);

                    Log.Info("Started consuming queue '" + _parameters.QueueName + "' on " + _parameters.ServerName + ":" + _parameters.Port);
                    return;
                }
                catch (Exception ex)
                {
                    Log.Error("Connection failed. Retrying in " + delay + "ms...", ex);
                    Thread.Sleep(delay);
                    delay = Math.Min(delay * 2, 60000);
                }
            }
        }

        private void OnConnectionShutdown(object sender, ShutdownEventArgs e)
        {
            Log.Error("Connection shutdown: " + e.ReplyText + " (Initiator: " + e.Initiator + ")");

            if (_stopped || e.Initiator == ShutdownInitiator.Application)
            {
                return;
            }

            ThreadPool.QueueUserWorkItem(_ => Reconnect());
        }

        private void OnCallbackException(object sender, CallbackExceptionEventArgs e)
        {
            Log.Error("Connection callback exception: " + e.Exception.Message, e.Exception);
        }

        private void OnChannelShutdown(object sender, ShutdownEventArgs e)
        {
            Log.Error("Channel shutdown: " + e.ReplyText + " (Initiator: " + e.Initiator + ")");
        }

        private void OnConsumerShutdown(object sender, ShutdownEventArgs e)
        {
            Log.Error("Consumer shutdown: " + e.ReplyText + " (Initiator: " + e.Initiator + ")");
        }

        private void OnMessageReceived(object sender, BasicDeliverEventArgs ea)
        {
            if (_stopped)
            {
                return;
            }

            try
            {
                string msg = Encoding.UTF8.GetString(ea.Body.ToArray());
                Log.Debug("Received message: " + msg);
                _handler(msg, _channel, ea.DeliveryTag);
            }
            catch (Exception ex)
            {
                Log.Error("Error in message handler", ex);
            }
        }

        private void Reconnect()
        {
            lock (_lock)
            {
                if (_stopped)
                {
                    return;
                }

                Log.Warn("Reconnecting...");
                Connect();
            }
        }

        public void Stop()
        {
            lock (_lock)
            {
                _stopped = true;
                Cleanup();
            }
        }

        private void Cleanup()
        {
            if (_consumer != null)
            {
                try
                {
                    _consumer.Received -= OnMessageReceived;
                    _consumer.Shutdown -= OnConsumerShutdown;
                }
                catch (Exception ex)
                {
                    Log.Warn("Error unsubscribing consumer events", ex);
                }
                _consumer = null;
            }

            if (_channel != null)
            {
                try
                {
                    _channel.ModelShutdown -= OnChannelShutdown;
                    if (_channel.IsOpen)
                    {
                        _channel.Close();
                    }
                    _channel.Dispose();
                }
                catch (Exception ex)
                {
                    Log.Warn("Error closing channel", ex);
                }
                _channel = null;
            }

            if (_connection != null)
            {
                try
                {
                    _connection.ConnectionShutdown -= OnConnectionShutdown;
                    _connection.CallbackException -= OnCallbackException;
                    if (_connection.IsOpen)
                    {
                        _connection.Close();
                    }
                    _connection.Dispose();
                }
                catch (Exception ex)
                {
                    Log.Warn("Error closing connection", ex);
                }
                _connection = null;
            }
        }

        public void Dispose()
        {
            Stop();
        }
    }
}
