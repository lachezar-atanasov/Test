namespace RabbitSender.Models
{
    public class RabbitConnectionParams
    {
        public string ServerName { get; set; }
        public int Port { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string VirtualHost { get; set; }
        public string QueueName { get; set; }
        public int Timeout { get; set; }
        public bool SSLEnabled { get; set; }
        public string ServerCN { get; set; }
    }
}
