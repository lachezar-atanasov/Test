using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using log4net;

namespace RabbitSender.Controllers
{
    public class RabbitSenderController : ApiController
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(RabbitSenderController));

        public HttpResponseMessage Post([FromBody] string message, string queue = null)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest, "message is required");
            }

            try
            {
                string queueName = string.IsNullOrWhiteSpace(queue)
                    ? WebApiApplication.Params.QueueName
                    : queue;

                WebApiApplication.Sender.Send(queueName, message);
                Log.Info("Message sent to queue: " + queueName);

                return Request.CreateResponse(HttpStatusCode.OK, "sent to " + queueName);
            }
            catch (Exception ex)
            {
                Log.Error("Failed to send message", ex);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }
    }
}
