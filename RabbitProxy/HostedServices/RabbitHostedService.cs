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

            _receiver.StartConsuming(rabbitParams, HandleMessage(allegroUrl, rabbitParams));

            Log.Info("RabbitHostedService is running and listening for messages.");
        }

        private Action<string, IModel, ulong> HandleMessage(string allegroUrl, RabbitConnectionParams rabbitParams)
        {
            return (msg, channel, tag) =>
            {
                bool shouldAck = false;
                bool shouldNack = false;

                try
                {
                    string tradeTypeToProcess = _leadService.GetParameter(allegroUrl, "RabbitMQ", "TAllowedType");

                    HashSet<int> allowedInstIds = null;
                    if (!string.IsNullOrWhiteSpace(tradeTypeToProcess))
                    {
                        int[] instIds = _leadService.GetInstIdsByProduct(allegroUrl, tradeTypeToProcess);
                        allowedInstIds = new HashSet<int>(instIds);
                    }

                    string xml = _parser.ConvertMessagesToXmlFiltered(new[] { msg }, allowedInstIds);

                    if (string.IsNullOrWhiteSpace(xml))
                    {
                        shouldAck = true;
                        Log.Info("Message skipped because no trades matched the configured product.");
                        return;
                    }

                    string configName = _leadService.GetParameter(allegroUrl, "RabbitMQ", "ImportConfigName");
                    bool uploaded = _loader.UploadToUniversalLoader(allegroUrl, xml, configName);

                    if (uploaded)
                    {
                        shouldAck = true;
                        Log.Info("Message acknowledged. Queue: " + rabbitParams.QueueName);
                    }
                    else
                    {
                        shouldNack = true;
                        Log.Error("Upload failed. Message will be requeued. Raw message: " + msg);
                    }
                }
                catch (Exception ex)
                {
                    shouldNack = true;
                    Log.Error("Error processing message. Message will be requeued.", ex);
                }
                finally
                {
                    try
                    {
                        if (shouldAck && channel.IsOpen)
                        {
                            channel.BasicAck(tag, false);
                        }
                        else if (shouldNack && channel.IsOpen)
                        {
                            channel.BasicNack(tag, false, true);
                        }
                    }
                    catch (Exception ackEx)
                    {
                        Log.Error("Failed to ack/nack message", ackEx);
                    }
                }
            };
        }
    }
}
