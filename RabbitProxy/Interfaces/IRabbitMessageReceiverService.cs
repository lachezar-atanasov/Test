// File: RabbitProxy/Interfaces/IRabbitMessageReceiverService.cs
using System;
using RabbitMQ.Client;
using RabbitProxy.Models;

namespace RabbitProxy.Interfaces
{
    /// <summary>
    /// Service interface for consuming messages from RabbitMQ.
    /// </summary>
    public interface IRabbitMessageReceiverService : IDisposable
    {
        /// <summary>
        /// Starts consuming messages from the configured queue.
        /// </summary>
        /// <param name="parameters">Connection and queue parameters.</param>
        /// <param name="handleMessage">
        /// Callback invoked for each message. Parameters are:
        /// - message: The message body as string
        /// - channel: The RabbitMQ channel (for ack/nack)
        /// - deliveryTag: The delivery tag for acknowledgment
        /// </param>
        void StartConsuming(RabbitConnectionParams parameters, Action<string, IModel, ulong> handleMessage);

        /// <summary>
        /// Stops consuming and releases resources.
        /// </summary>
        void Stop();

        /// <summary>
        /// Returns true if currently consuming.
        /// </summary>
        bool IsConsuming { get; }
    }
}
