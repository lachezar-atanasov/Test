using System;
using System.Web.Services;

namespace RabbitSender
{
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    public class RabbitSenderService : WebService
    {
        [WebMethod]
        public bool SendMessage(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                throw new ArgumentException("message is required");
            }

            Global.Sender.Send(Global.Params.QueueName, message);
            return true;
        }

        [WebMethod]
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

            Global.Sender.Send(queueName, message);
            return true;
        }
    }
}
