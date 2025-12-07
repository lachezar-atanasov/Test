// File: RabbitConnectionParams.cs
using System;

namespace RabbitProxy.Models
{
    /// <summary>
    /// Configuration parameters for establishing a RabbitMQ connection.
    /// </summary>
    public class RabbitConnectionParams
    {
        /// <summary>
        /// Gets or sets the RabbitMQ server hostname or IP address.
        /// </summary>
        public string ServerName { get; set; }

        /// <summary>
        /// Gets or sets the RabbitMQ server port (default is typically 5672 or 5671 for SSL).
        /// </summary>
        public int Port { get; set; }

        /// <summary>
        /// Gets or sets the connection timeout in milliseconds.
        /// </summary>
        public int Timeout { get; set; }

        /// <summary>
        /// Gets or sets the queue name to use.
        /// </summary>
        public string QueueName { get; set; }

        /// <summary>
        /// Gets or sets the RabbitMQ username for authentication.
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Gets or sets the RabbitMQ password for authentication.
        /// </summary>
        public string Password { get; set; }

        /// <summary>
        /// Gets or sets the virtual host (default is "/").
        /// </summary>
        public string VirtualHost { get; set; }

        /// <summary>
        /// Gets or sets whether SSL/TLS is enabled for the connection.
        /// </summary>
        public bool SSLEnabled { get; set; }

        /// <summary>
        /// Gets or sets the expected Common Name (CN) from the server certificate.
        /// Used for SSL certificate validation.
        /// </summary>
        public string ServerCN { get; set; }

        /// <summary>
        /// Creates a new instance with default values.
        /// </summary>
        public RabbitConnectionParams()
        {
            Port = 5672;
            Timeout = 30000;
            VirtualHost = "/";
            SSLEnabled = false;
        }

        /// <summary>
        /// Validates that required connection parameters are set.
        /// </summary>
        /// <exception cref="InvalidOperationException">Thrown when required parameters are missing.</exception>
        public void Validate()
        {
            if (string.IsNullOrWhiteSpace(ServerName))
            {
                throw new InvalidOperationException("ServerName is required.");
            }

            if (Port <= 0 || Port > 65535)
            {
                throw new InvalidOperationException("Port must be between 1 and 65535.");
            }

            if (string.IsNullOrWhiteSpace(QueueName))
            {
                throw new InvalidOperationException("QueueName is required.");
            }

            if (SSLEnabled && string.IsNullOrWhiteSpace(ServerCN))
            {
                throw new InvalidOperationException("ServerCN is required when SSL is enabled.");
            }
        }
    }
}
