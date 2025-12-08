using System;
using System.Web.Services;
using System.Web.Services.Protocols;
using log4net;

namespace RabbitSender
{
    [WebService(Namespace = "http://rabbitsender.local/", Description = "RabbitMQ Message Sender Service")]
    [WebServiceBinding(ConformsTo = WsiProfiles.None)]
    public class RabbitSenderService : WebService
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(RabbitSenderService));

        [WebMethod(Description = "Send message to default configured queue")]
        public bool Send(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                throw new ArgumentException("message is required");
            }

            try
            {
                WebApiApplication.Sender.Send(WebApiApplication.Params.QueueName, message);
                Log.Info("Message sent to queue: " + WebApiApplication.Params.QueueName);
                return true;
            }
            catch (Exception ex)
            {
                Log.Error("Failed to send message", ex);
                throw;
            }
        }

        [WebMethod(Description = "Send message to specific queue")]
        public bool SendToQueue(string queueName, string message)
        {
            if (string.IsNullOrWhiteSpace(queueName))
            {
                throw new ArgumentException("queueName is required");
            }

            if (string.IsNullOrWhiteSpace(message))
            {
                throw new ArgumentException("message is required");
            }

            try
            {
                WebApiApplication.Sender.Send(queueName, message);
                Log.Info("Message sent to queue: " + queueName);
                return true;
            }
            catch (Exception ex)
            {
                Log.Error("Failed to send message to queue: " + queueName, ex);
                throw;
            }
        }

        [WebMethod(Description = "Get default queue name")]
        public string GetDefaultQueue()
        {
            return WebApiApplication.Params?.QueueName ?? "not configured";
        }
    }
}
