using log4net;
using log4net.Appender;
using log4net.Core;
using log4net.Layout;
using log4net.Repository.Hierarchy;
using System;
using System.Configuration;
using System.IO;
using System.Web.Http;
using RabbitSender.Models;
using RabbitSender.Services;

namespace RabbitSender
{
    public class WebApiApplication : System.Web.HttpApplication
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

        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
            ConfigureLogging();

            var log = LogManager.GetLogger(typeof(WebApiApplication));
            log.Info("Log4net initialized.");

            try
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

                log.Info("RabbitMQ sender connected.");
            }
            catch (Exception ex)
            {
                log.Error("Failed to start.", ex);
                throw;
            }
        }

        protected void Application_End()
        {
            if (_sender != null)
            {
                _sender.Dispose();
                _sender = null;
            }
        }

        private void ConfigureLogging()
        {
            string logFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Logs");

            if (!Directory.Exists(logFolder))
            {
                Directory.CreateDirectory(logFolder);
            }

            var layout = new PatternLayout
            {
                ConversionPattern = "%date [%thread] %-5level %logger - %message%newline"
            };
            layout.ActivateOptions();

            var appender = new RollingFileAppender
            {
                Name = "RollingFileAppender",
                File = Path.Combine(logFolder, "RabbitSender.log"),
                AppendToFile = true,
                RollingStyle = RollingFileAppender.RollingMode.Date,
                DatePattern = "yyyyMMdd'.log'",
                Layout = layout,
                LockingModel = new FileAppender.MinimalLock()
            };
            appender.ActivateOptions();

            var hierarchy = (Hierarchy)LogManager.GetRepository();
            hierarchy.Root.AddAppender(appender);

            string levelName = ConfigurationManager.AppSettings["LogLevel"] ?? "DEBUG";
            hierarchy.Root.Level = hierarchy.LevelMap[levelName.ToUpper()] ?? Level.Debug;
            hierarchy.Configured = true;
        }
    }
}
