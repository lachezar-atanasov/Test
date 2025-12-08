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
                        SafeAck(channel, tag);
                        Log.Info("Message skipped. TradeId: " + ExtractXmlValue(msg, "tradeId") + ", InstrumentId: " + ExtractXmlValue(msg, "instrumentId"));
                        return;
                    }

                    string configName = _leadService.GetParameter(allegroUrl, "RabbitMQ", "ImportConfigName");
                    bool uploaded = _loader.UploadToUniversalLoader(allegroUrl, xml, configName);

                    if (uploaded)
                    {
                        SafeAck(channel, tag);
                        Log.Info("Message acknowledged. Queue: " + rabbitParams.QueueName);
                    }
                    else
                    {
                        SafeAck(channel, tag);
                        Log.Error("Upload failed. Message acknowledged for safety. Replay this message manually. Raw message: " + msg);
                    }
                }
                catch (Exception ex)
                {
                    SafeAck(channel, tag);
                    Log.Error("Error processing message. Message acknowledged for safety. Replay this message manually. Raw message: " + msg, ex);
                }
            };
        }

        private void SafeAck(IModel channel, ulong tag)
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
                Log.Error("Failed to acknowledge message", ex);
            }
        }

        private static string ExtractXmlValue(string xml, string tagName)
        {
            try
            {
                string startTag = "<" + tagName + ">";
                string endTag = "</" + tagName + ">";

                int start = xml.IndexOf(startTag);
                if (start < 0)
                {
                    return "N/A";
                }

                start += startTag.Length;
                int end = xml.IndexOf(endTag, start);
                if (end < 0)
                {
                    return "N/A";
                }

                return xml.Substring(start, end - start);
            }
            catch
            {
                return "N/A";
            }
        }
    }
}
