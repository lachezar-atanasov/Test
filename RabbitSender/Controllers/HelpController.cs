using System.Web.Http;

namespace RabbitSender.Controllers
{
    public class HelpController : ApiController
    {
        [HttpGet]
        [Route("")]
        [Route("api")]
        [Route("api/help")]
        public IHttpActionResult Index()
        {
            var help = new
            {
                service = "RabbitSender",
                endpoints = new[]
                {
                    new
                    {
                        method = "POST",
                        url = "/api/RabbitSender/Send",
                        description = "Send message to default queue",
                        body = "string (message content)",
                        example = "curl -X POST -H \"Content-Type: application/json\" -d '\"<trade><tradeId>123</tradeId></trade>\"' http://localhost/api/RabbitSender/Send"
                    },
                    new
                    {
                        method = "POST",
                        url = "/api/RabbitSender/SendToQueue?queueName={queue}",
                        description = "Send message to specific queue",
                        body = "string (message content)",
                        example = "curl -X POST -H \"Content-Type: application/json\" -d '\"<trade><tradeId>123</tradeId></trade>\"' http://localhost/api/RabbitSender/SendToQueue?queueName=myqueue"
                    }
                },
                defaultQueue = WebApiApplication.Params?.QueueName ?? "not configured"
            };

            return Ok(help);
        }
    }
}
