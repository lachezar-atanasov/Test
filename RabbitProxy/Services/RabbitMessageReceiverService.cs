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
    public class RabbitMessageReceiverService : IRabbitMessageReceiverService
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(RabbitMessageReceiverService));

        private readonly object _lock = new object();
        private readonly RabbitMQConnectionHolder _connectionHolder = new RabbitMQConnectionHolder();

        private string _channelKey;
        private RabbitConnectionParams _lastParameters;
        private Action<string, IModel, ulong> _lastHandler;
        private volatile bool _stopped;
        private volatile bool _isConsuming;

        private const int MaxRestartDelayMs = 60000;
        private const int InitialRestartDelayMs = 1000;

        public void StartConsuming(RabbitConnectionParams parameters, Action<string, IModel, ulong> handleMessage)
        {
            lock (_lock)
            {
                if (_isConsuming)
                {
                    throw new InvalidOperationException("Consumer is already running. Call Stop() first.");
                }

                _lastParameters = parameters;
                _lastHandler = handleMessage;
                _stopped = false;

                _connectionHolder.ChannelLost += OnChannelLost;

                StartConsumerInternal();
            }
        }

        private void StartConsumerInternal()
        {
            _connectionHolder.EnsureConnected(_lastParameters);

            _channelKey = _lastParameters.ServerName + ":" + _lastParameters.QueueName;
            var channel = _connectionHolder.GetOrCreateChannel(_channelKey);

            channel.QueueDeclarePassive(_lastParameters.QueueName);
            channel.BasicQos(0, 1, false);

            var consumer = new EventingBasicConsumer(channel);

            consumer.Received += OnMessageReceived;

            consumer.Shutdown += (s, e) =>
            {
                Log.Error("Consumer shutdown: " + e.ReplyText);
            };

            channel.BasicConsume(_lastParameters.QueueName, false, consumer);
            _isConsuming = true;

            Log.Info("Started consuming queue '" + _lastParameters.QueueName + "' on host '" + _lastParameters.ServerName + ":" + _lastParameters.Port + "'");
        }

        private void OnMessageReceived(object model, BasicDeliverEventArgs ea)
        {
            IModel channel;
            Action<string, IModel, ulong> handler;

            lock (_lock)
            {
                if (_stopped)
                {
                    return;
                }

                handler = _lastHandler;
                if (_channelKey == null)
                {
                    return;
                }

                channel = ((EventingBasicConsumer)model).Model;
            }

            try
            {
                string msg = Encoding.UTF8.GetString(ea.Body.ToArray());
                Log.Debug("Received Rabbit message: " + msg);
                handler(msg, channel, ea.DeliveryTag);
            }
            catch (Exception ex)
            {
                Log.Error("Unhandled exception in message handler", ex);
            }
        }

        private void OnChannelLost(string channelKey)
        {
            lock (_lock)
            {
                if (_stopped || channelKey != _channelKey)
                {
                    return;
                }

                _isConsuming = false;
            }

            ScheduleRestart();
        }

        private void ScheduleRestart()
        {
            ThreadPool.QueueUserWorkItem(_ => RestartConsumerWithBackoff());
        }

        private void RestartConsumerWithBackoff()
        {
            int delay = InitialRestartDelayMs;

            while (!_stopped)
            {
                try
                {
                    Log.Warn("Attempting to restart RabbitMQ consumer in " + delay + "ms...");
                    Thread.Sleep(delay);

                    lock (_lock)
                    {
                        if (_stopped)
                        {
                            return;
                        }

                        if (_channelKey != null)
                        {
                            _connectionHolder.RemoveChannel(_channelKey);
                            _channelKey = null;
                        }

                        StartConsumerInternal();
                        Log.Info("RabbitMQ consumer restarted successfully.");
                        return;
                    }
                }
                catch (Exception ex)
                {
                    Log.Error("Failed to restart consumer. Will retry...", ex);
                    delay = Math.Min(delay * 2, MaxRestartDelayMs);
                }
            }
        }

        public void Stop()
        {
            lock (_lock)
            {
                _stopped = true;
                _isConsuming = false;

                _connectionHolder.ChannelLost -= OnChannelLost;

                if (_channelKey != null)
                {
                    _connectionHolder.RemoveChannel(_channelKey);
                    _channelKey = null;
                }

                _connectionHolder.Dispose();
            }
        }
    }
}
