using System;
using System.Text;
using RabbitMQ.Client;
using RabbitSender.Models;

namespace RabbitSender.Services
{
    public class RabbitMessageSenderService : IDisposable
    {
        private IConnection _connection;
        private IModel _channel;

        public void Connect(RabbitConnectionParams parameters)
        {
            var factory = new ConnectionFactory
            {
                HostName = parameters.ServerName,
                Port = parameters.Port,
                UserName = parameters.Username,
                Password = parameters.Password,
                VirtualHost = parameters.VirtualHost,
                RequestedConnectionTimeout = TimeSpan.FromMilliseconds(parameters.Timeout),
                Ssl = new SslOption
                {
                    Enabled = parameters.SSLEnabled,
                    ServerName = parameters.ServerCN ?? parameters.ServerName,
                    Version = System.Security.Authentication.SslProtocols.Tls12
                }
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();
            _channel.QueueDeclarePassive(parameters.QueueName);
        }

        public void Send(string queueName, string message)
        {
            if (_channel == null || !_channel.IsOpen)
            {
                throw new InvalidOperationException("Not connected. Call Connect first.");
            }

            byte[] body = Encoding.UTF8.GetBytes(message);
            _channel.BasicPublish("", queueName, null, body);
        }

        public void Dispose()
        {
            if (_channel != null)
            {
                if (_channel.IsOpen)
                {
                    _channel.Close();
                }
                _channel.Dispose();
                _channel = null;
            }

            if (_connection != null)
            {
                if (_connection.IsOpen)
                {
                    _connection.Close();
                }
                _connection.Dispose();
                _connection = null;
            }
        }
    }
}
