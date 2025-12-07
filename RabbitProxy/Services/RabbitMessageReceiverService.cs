// File: RabbitProxy/Services/RabbitMessageReceiverService.cs
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
    /// <summary>
    /// Service for consuming messages from a RabbitMQ queue.
    /// Uses manual acknowledgments and configurable QoS.
    /// </summary>
    public class RabbitMessageReceiverService : IRabbitMessageReceiverService
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(RabbitMessageReceiverService));

        private readonly RabbitMQConnectionHolder _connectionHolder;
        private readonly bool _ownsConnectionHolder;

        private string _channelKey;
        private RabbitConnectionParams _parameters;
        private Action<string, IModel, ulong> _messageHandler;
        private string _consumerTag;

        private readonly object _stateLock = new object();
        private volatile bool _isConsuming;
        private volatile bool _disposed;

        // Restart control
        private volatile bool _restartInProgress;
        private int _restartAttempts;
        private const int MaxRestartAttempts = 5;
        private const int RestartDelayMs = 3000;

        /// <summary>
        /// Creates a new receiver with a new connection holder.
        /// </summary>
        public RabbitMessageReceiverService()
            : this(new RabbitMQConnectionHolder(), true)
        {
        }

        /// <summary>
        /// Creates a new receiver with a shared connection holder.
        /// </summary>
        /// <param name="connectionHolder">Shared connection holder.</param>
        public RabbitMessageReceiverService(RabbitMQConnectionHolder connectionHolder)
            : this(connectionHolder, false)
        {
        }

        private RabbitMessageReceiverService(RabbitMQConnectionHolder connectionHolder, bool ownsConnectionHolder)
        {
            if (connectionHolder == null)
                throw new ArgumentNullException("connectionHolder");

            _connectionHolder = connectionHolder;
            _ownsConnectionHolder = ownsConnectionHolder;
        }

        /// <summary>
        /// Returns true if currently consuming messages.
        /// </summary>
        public bool IsConsuming
        {
            get { return _isConsuming; }
        }

        /// <summary>
        /// Starts consuming messages from the queue specified in parameters.
        /// </summary>
        /// <param name="parameters">Connection and queue parameters.</param>
        /// <param name="handleMessage">
        /// Callback for each message. The callback receives:
        /// - message body (string)
        /// - channel (for calling BasicAck/BasicNack)
        /// - deliveryTag (for acknowledgment)
        /// 
        /// IMPORTANT: The callback is responsible for calling BasicAck or BasicNack.
        /// </param>
        public void StartConsuming(RabbitConnectionParams parameters, Action<string, IModel, ulong> handleMessage)
        {
            if (_disposed)
                throw new ObjectDisposedException(GetType().Name);

            if (parameters == null)
                throw new ArgumentNullException("parameters");

            if (handleMessage == null)
                throw new ArgumentNullException("handleMessage");

            parameters.Validate();

            lock (_stateLock)
            {
                if (_isConsuming)
                {
                    Log.Warn("Already consuming. Call Stop() first to restart.");
                    return;
                }

                _parameters = parameters;
                _messageHandler = handleMessage;
                _restartAttempts = 0;

                StartConsumerInternal();
            }
        }

        private void StartConsumerInternal()
        {
            try
            {
                // Ensure connection
                _connectionHolder.EnsureConnected(_parameters);

                // Create channel
                _channelKey = string.Format("{0}:{1}:{2}",
                    _parameters.ServerName,
                    _parameters.Port,
                    _parameters.QueueName);

                IModel channel = _connectionHolder.GetOrCreateChannel(_channelKey);

                // Verify queue exists (passive declare)
                try
                {
                    channel.QueueDeclarePassive(_parameters.QueueName);
                }
                catch (Exception ex)
                {
                    Log.Error(string.Format(
                        "Queue '{0}' does not exist or is not accessible", _parameters.QueueName), ex);
                    throw;
                }

                // Set QoS (prefetch count)
                // This limits how many unacked messages the consumer can hold
                channel.BasicQos(
                    prefetchSize: 0,
                    prefetchCount: _parameters.PrefetchCount,
                    global: false);

                Log.Debug(string.Format("Set QoS prefetchCount={0}", _parameters.PrefetchCount));

                // Create consumer
                var consumer = new EventingBasicConsumer(channel);

                consumer.Received += OnMessageReceived;
                consumer.Shutdown += OnConsumerShutdown;
                consumer.ConsumerCancelled += OnConsumerCancelled;

                // Subscribe to channel shutdown
                channel.ModelShutdown += OnChannelShutdown;

                // Start consuming with manual acknowledgment (autoAck = false)
                _consumerTag = channel.BasicConsume(
                    queue: _parameters.QueueName,
                    autoAck: false,
                    consumer: consumer);

                _isConsuming = true;

                Log.Info(string.Format(
                    "Started consuming queue '{0}' on {1}:{2} (consumerTag={3})",
                    _parameters.QueueName,
                    _parameters.ServerName,
                    _parameters.Port,
                    _consumerTag));
            }
            catch (Exception ex)
            {
                _isConsuming = false;
                Log.Error("Failed to start consumer", ex);
                throw;
            }
        }

        private void OnMessageReceived(object sender, BasicDeliverEventArgs ea)
        {
            var consumer = sender as EventingBasicConsumer;
            if (consumer == null || consumer.Model == null)
                return;

            string message = null;
            try
            {
                // RabbitMQ.Client 5.x: ea.Body is byte[] directly
                byte[] body = ea.Body;
                message = Encoding.UTF8.GetString(body);

                Log.Debug(string.Format("Received message (tag={0}, length={1})",
                    ea.DeliveryTag, body.Length));
            }
            catch (Exception ex)
            {
                Log.Error("Failed to decode message body", ex);

                // Reject the message (don't requeue malformed messages)
                TryNack(consumer.Model, ea.DeliveryTag, requeue: false);
                return;
            }

            try
            {
                // Invoke user handler - it's responsible for ack/nack
                _messageHandler(message, consumer.Model, ea.DeliveryTag);
            }
            catch (Exception ex)
            {
                Log.Error("Message handler threw an exception", ex);

                // Handler failed - nack with requeue so message isn't lost
                // Note: This could cause infinite requeue loops for poison messages.
                // Consider implementing dead-letter queue handling.
                TryNack(consumer.Model, ea.DeliveryTag, requeue: true);
            }
        }

        private void TryNack(IModel channel, ulong deliveryTag, bool requeue)
        {
            try
            {
                if (channel != null && channel.IsOpen)
                {
                    channel.BasicNack(deliveryTag, multiple: false, requeue: requeue);
                }
            }
            catch (Exception ex)
            {
                Log.Error("Failed to nack message", ex);
            }
        }

        private void OnConsumerShutdown(object sender, ShutdownEventArgs e)
        {
            Log.Warn(string.Format("Consumer shutdown: {0} (Code: {1})", e.ReplyText, e.ReplyCode));
            ScheduleRestart();
        }

        private void OnConsumerCancelled(object sender, ConsumerEventArgs e)
        {
            Log.Warn(string.Format("Consumer cancelled: {0}", e.ConsumerTag));
            ScheduleRestart();
        }

        private void OnChannelShutdown(object sender, ShutdownEventArgs e)
        {
            Log.Warn(string.Format("Channel shutdown: {0} (Code: {1})", e.ReplyText, e.ReplyCode));
            // Note: RabbitMQ automatic recovery should handle channel recovery.
            // Only restart if consumer is no longer functional.
        }

        private void ScheduleRestart()
        {
            if (_disposed || _restartInProgress)
                return;

            _restartInProgress = true;

            // Run restart in background to avoid blocking callback
            ThreadPool.QueueUserWorkItem(_ => TryRestartConsumer());
        }

        private void TryRestartConsumer()
        {
            try
            {
                lock (_stateLock)
                {
                    if (_disposed)
                        return;

                    _restartAttempts++;

                    if (_restartAttempts > MaxRestartAttempts)
                    {
                        Log.Error(string.Format(
                            "Max restart attempts ({0}) exceeded. Consumer stopped.", MaxRestartAttempts));
                        _isConsuming = false;
                        return;
                    }

                    Log.Warn(string.Format(
                        "Restarting consumer (attempt {0}/{1})...",
                        _restartAttempts, MaxRestartAttempts));

                    // Wait before restart
                    Thread.Sleep(RestartDelayMs);

                    // Clean up old channel
                    StopInternal();

                    // Restart
                    StartConsumerInternal();

                    Log.Info("Consumer restarted successfully");
                    _restartAttempts = 0;
                }
            }
            catch (Exception ex)
            {
                Log.Error("Failed to restart consumer", ex);
                _isConsuming = false;
            }
            finally
            {
                _restartInProgress = false;
            }
        }

        /// <summary>
        /// Stops consuming messages.
        /// </summary>
        public void Stop()
        {
            lock (_stateLock)
            {
                StopInternal();
            }
        }

        private void StopInternal()
        {
            _isConsuming = false;

            if (!string.IsNullOrEmpty(_channelKey))
            {
                _connectionHolder.RemoveChannel(_channelKey);
                _channelKey = null;
            }

            _consumerTag = null;

            Log.Debug("Consumer stopped");
        }

        /// <summary>
        /// Disposes the receiver and optionally the connection holder.
        /// </summary>
        public void Dispose()
        {
            if (_disposed)
                return;

            _disposed = true;

            Stop();

            if (_ownsConnectionHolder)
            {
                _connectionHolder.Dispose();
            }

            Log.Debug("RabbitMessageReceiverService disposed");
        }
    }
}
