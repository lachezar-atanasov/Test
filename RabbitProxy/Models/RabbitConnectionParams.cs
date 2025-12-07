// File: RabbitProxy/Models/RabbitConnectionParams.cs
using System;

namespace RabbitProxy.Models
{
    /// <summary>
    /// Configuration parameters for establishing a RabbitMQ connection.
    /// </summary>
    public class RabbitConnectionParams
    {
        /// <summary>
        /// RabbitMQ server hostname or IP address.
        /// </summary>
        public string ServerName { get; set; }

        /// <summary>
        /// RabbitMQ server port (default: 5672, SSL: 5671).
        /// </summary>
        public int Port { get; set; }

        /// <summary>
        /// Connection timeout in milliseconds.
        /// </summary>
        public int Timeout { get; set; }

        /// <summary>
        /// Queue name to consume from.
        /// </summary>
        public string QueueName { get; set; }

        /// <summary>
        /// RabbitMQ username.
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// RabbitMQ password.
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// Virtual host (default: "/").
        /// </summary>
        public string VirtualHost { get; set; }

        /// <summary>
        /// Enable SSL/TLS connection.
        /// </summary>
        public bool SSLEnabled { get; set; }

        /// <summary>
        /// Server certificate common name (CN) for SSL validation.
        /// If null, ServerName is used.
        /// </summary>
        public string ServerCN { get; set; }

        /// <summary>
        /// Number of messages to prefetch (QoS). Default is 1.
        /// </summary>
        public ushort PrefetchCount { get; set; }

        /// <summary>
        /// Maximum number of connection retry attempts. 0 = infinite.
        /// </summary>
        public int MaxConnectionRetries { get; set; }

        /// <summary>
        /// Delay between connection retry attempts in milliseconds.
        /// </summary>
        public int RetryDelayMs { get; set; }

        public RabbitConnectionParams()
        {
            Port = 5672;
            Timeout = 30000;
            VirtualHost = "/";
            PrefetchCount = 10;
            MaxConnectionRetries = 5;
            RetryDelayMs = 5000;
        }

        /// <summary>
        /// Validates that required parameters are set.
        /// </summary>
        public void Validate()
        {
            if (string.IsNullOrWhiteSpace(ServerName))
                throw new ArgumentException("ServerName is required", "ServerName");

            if (string.IsNullOrWhiteSpace(QueueName))
                throw new ArgumentException("QueueName is required", "QueueName");

            if (Port <= 0 || Port > 65535)
                throw new ArgumentOutOfRangeException("Port", "Port must be between 1 and 65535");

            if (Timeout <= 0)
                throw new ArgumentOutOfRangeException("Timeout", "Timeout must be positive");
        }
    }
}
