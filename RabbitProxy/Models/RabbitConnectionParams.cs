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
		/// Gets or sets the RabbitMQ server port (default is 5672 for non-SSL, 5671 for SSL).
		/// </summary>
		public int Port { get; set; }

		/// <summary>
		/// Gets or sets the connection timeout in milliseconds.
		/// </summary>
		public int Timeout { get; set; }

		/// <summary>
		/// Gets or sets the queue name to use for messaging operations.
		/// </summary>
		public string QueueName { get; set; }

		/// <summary>
		/// Gets or sets the username for RabbitMQ authentication.
		/// </summary>
		public string Username { get; set; }

		/// <summary>
		/// Gets or sets the password for RabbitMQ authentication.
		/// </summary>
		public string Password { get; set; }

		/// <summary>
		/// Gets or sets the virtual host name (default is "/").
		/// </summary>
		public string VirtualHost { get; set; }

		/// <summary>
		/// Gets or sets a value indicating whether SSL/TLS encryption is enabled.
		/// </summary>
		public bool SSLEnabled { get; set; }

		/// <summary>
		/// Gets or sets the Common Name (CN) from the server certificate for SSL validation.
		/// </summary>
		public string ServerCN { get; set; }
	}
}
