using System;
using System.Web.Http;
using log4net;

namespace RabbitSender.Controllers
{
    public class RabbitSenderController : ApiController
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(RabbitSenderController));

        [HttpPost]
        public IHttpActionResult Send([FromBody] string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                return BadRequest("message is required");
            }

            try
            {
                WebApiApplication.Sender.Send(WebApiApplication.Params.QueueName, message);
                Log.Info("Message sent to queue: " + WebApiApplication.Params.QueueName);
                return Ok(new { success = true, queue = WebApiApplication.Params.QueueName });
            }
            catch (Exception ex)
            {
                Log.Error("Failed to send message", ex);
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        public IHttpActionResult SendToQueue(string queueName, [FromBody] string message)
        {
            if (string.IsNullOrWhiteSpace(queueName))
            {
                return BadRequest("queueName is required");
            }

            if (string.IsNullOrWhiteSpace(message))
            {
                return BadRequest("message is required");
            }

            try
            {
                WebApiApplication.Sender.Send(queueName, message);
                Log.Info("Message sent to queue: " + queueName);
                return Ok(new { success = true, queue = queueName });
            }
            catch (Exception ex)
            {
                Log.Error("Failed to send message to queue: " + queueName, ex);
                return InternalServerError(ex);
            }
        }
    }
}
