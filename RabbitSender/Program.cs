using System;
using System.Configuration;
using RabbitSender.Models;
using RabbitSender.Services;

namespace RabbitSender
{
    class Program
    {
        static void Main(string[] args)
        {
            string allegroUrl = ConfigurationManager.AppSettings["AllegroUrl"];
            var leadService = new LeadParameterService();

            var rabbitParams = new RabbitConnectionParams
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

            using (var sender = new RabbitMessageSenderService())
            {
                sender.Connect(rabbitParams);

                string message = args.Length > 0 ? args[0] : GetSampleMessage();

                sender.Send(rabbitParams.QueueName, message);
                Console.WriteLine("Message sent to queue: " + rabbitParams.QueueName);
            }
        }

        static string GetSampleMessage()
        {
            return @"<?xml version=""1.0"" encoding=""UTF-8"" standalone=""yes""?>
<trade>
<tradeId>12345</tradeId>
<instrumentId>K10001126</instrumentId>
<product>KGermany Base Weekend</product>
</trade>";
        }
    }
}
