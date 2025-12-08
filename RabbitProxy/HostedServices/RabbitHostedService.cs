using System;
using System.Collections.Generic;
using System.Configuration;
using log4net;
using RabbitMQ.Client;
using RabbitProxy.Interfaces;
using RabbitProxy.Models;
using RabbitProxy.Services;

namespace RabbitProxy.HostedServices
{
    public class RabbitHostedService : IRabbitHostedService
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(RabbitHostedService));

        private readonly IRabbitMessageReceiverService _receiver;
        private readonly IUniversalLoaderService _loader;
        private readonly ILeadParameterService _leadService;
        private readonly XmlTradeParserService _parser;

        public RabbitHostedService()
        {
            _receiver = new RabbitMessageReceiverService();
            _loader = new UniversalLoaderService();
            _leadService = new LeadParameterService();
            _parser = new XmlTradeParserService();
        }

        public void Start()
        {
            string allegroUrl = ConfigurationManager.AppSettings["AllegroUrl"];

            var rabbitParams = new RabbitConnectionParams
            {
                ServerName = _leadService.GetParameter(allegroUrl, "RabbitMQ", "ServerName"),
                QueueName = _leadService.GetParameter(allegroUrl, "RabbitMQ", "QueueName"),
                Username = _leadService.GetParameter(allegroUrl, "RabbitMQ", "Username"),
                Password = _leadService.GetParameter(allegroUrl, "RabbitMQ", "Password"),
                VirtualHost = _leadService.GetParameter(allegroUrl, "RabbitMQ", "VirtualHost"),
                Port = int.Parse(_leadService.GetParameter(allegroUrl, "RabbitMQ", "Port")),
                Timeout = int.Parse(_leadService.GetParameter(allegroUrl, "RabbitMQ", "Timeout")),
                SSLEnabled = bool.Parse(_leadService.GetParameter(allegroUrl, "RabbitMQ", "SSLEnabled")),
                ServerCN = _leadService.GetParameter(allegroUrl, "RabbitMQ", "ServerCN")
            };

            _receiver.StartConsuming(rabbitParams, (msg, channel, tag) => HandleMessage(msg, channel, tag, allegroUrl, rabbitParams.QueueName));

            Log.Info("RabbitHostedService started.");
        }

        private void HandleMessage(string msg, IModel channel, ulong tag, string allegroUrl, string queueName)
        {
            try
            {
                string tradeType = _leadService.GetParameter(allegroUrl, "RabbitMQ", "TAllowedType");

                HashSet<int> allowedInstIds = null;
                if (!string.IsNullOrWhiteSpace(tradeType))
                {
                    allowedInstIds = new HashSet<int>(_leadService.GetInstIdsByProduct(allegroUrl, tradeType));
                }

                string xml = _parser.ConvertMessagesToXmlFiltered(new[] { msg }, allowedInstIds);

                if (string.IsNullOrWhiteSpace(xml))
                {
                    Ack(channel, tag);
                    Log.Info("Message skipped - no matching trades.");
                    return;
                }

                string configName = _leadService.GetParameter(allegroUrl, "RabbitMQ", "ImportConfigName");

                if (_loader.UploadToUniversalLoader(allegroUrl, xml, configName))
                {
                    Ack(channel, tag);
                    Log.Info("Message processed. Queue: " + queueName);
                }
                else
                {
                    Log.Error("Upload failed. Message left for retry. Raw: " + msg);
                }
            }
            catch (Exception ex)
            {
                Log.Error("Error processing message. Left for retry.", ex);
            }
        }

        private void Ack(IModel channel, ulong tag)
        {
            try
            {
                if (channel.IsOpen)
                {
                    channel.BasicAck(tag, false);
                }
            }
            catch (Exception ex)
            {
                Log.Error("Failed to ack", ex);
            }
        }
    }
}
