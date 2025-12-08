using System;
using System.Configuration;
using System.Web;
using RabbitSender.Models;
using RabbitSender.Services;

namespace RabbitSender
{
    public class Global : HttpApplication
    {
        private static RabbitMessageSenderService _sender;
        private static RabbitConnectionParams _params;

        public static RabbitMessageSenderService Sender
        {
            get { return _sender; }
        }

        public static RabbitConnectionParams Params
        {
            get { return _params; }
        }

        protected void Application_Start(object sender, EventArgs e)
        {
            string allegroUrl = ConfigurationManager.AppSettings["AllegroUrl"];
            var leadService = new LeadParameterService();

            _params = new RabbitConnectionParams
            {
                ServerName = leadService.GetParameter(allegroUrl, "RabbitMQ", "ServerName"),
                QueueName = leadService.GetParameter(allegroUrl, "RabbitMQ", "QueueName"),
                Username = leadService.GetParameter(allegroUrl, "RabbitMQ", "Username"),
                Password = leadService.GetParameter(allegroUrl, "RabbitMQ", "Password"),
                VirtualHost = leadService.GetParameter(allegroUrl, "RabbitMQ", "VirtualHost"),
                Port = int.Parse(leadService.GetParameter(allegroUrl, "RabbitMQ", "Port")),
                Timeout = int.Parse(leadService.GetParameter(allegroUrl, "RabbitMQ", "Timeout")),
                SSLEnabled = bool.Parse(leadService.GetParameter(allegroUrl, "RabbitMQ", "SSLEnabled")),
                ServerCN = leadService.GetParameter(allegroUrl, "RabbitMQ", "ServerCN")
            };

            _sender = new RabbitMessageSenderService();
            _sender.Connect(_params);
        }

        protected void Application_End(object sender, EventArgs e)
        {
            if (_sender != null)
            {
                _sender.Dispose();
                _sender = null;
            }
        }
    }
}
