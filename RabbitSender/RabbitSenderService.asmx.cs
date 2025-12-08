using System.Web.Services;

namespace RabbitSender
{
    [WebService(Namespace = "http://rabbitsender.local/")]
    public class RabbitSenderService : WebService
    {
        [WebMethod]
        public bool Send(string message)
        {
            WebApiApplication.Sender.Send(WebApiApplication.Params.QueueName, message);
            return true;
        }

        [WebMethod]
        public bool SendToQueue(string queueName, string message)
        {
            WebApiApplication.Sender.Send(queueName, message);
            return true;
        }
    }
}
