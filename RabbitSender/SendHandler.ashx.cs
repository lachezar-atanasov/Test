using System;
using System.IO;
using System.Web;
using log4net;

namespace RabbitSender
{
    public class SendHandler : IHttpHandler
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(SendHandler));

        public bool IsReusable
        {
            get { return true; }
        }

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";

            try
            {
                string message;
                using (var reader = new StreamReader(context.Request.InputStream))
                {
                    message = reader.ReadToEnd();
                }

                if (string.IsNullOrWhiteSpace(message))
                {
                    context.Response.StatusCode = 400;
                    context.Response.Write("message is required in request body");
                    return;
                }

                string queueName = context.Request.QueryString["queue"] ?? WebApiApplication.Params.QueueName;

                WebApiApplication.Sender.Send(queueName, message);

                Log.Info("Message sent to queue: " + queueName);
                context.Response.Write("OK - sent to " + queueName);
            }
            catch (Exception ex)
            {
                Log.Error("Failed to send message", ex);
                context.Response.StatusCode = 500;
                context.Response.Write("Error: " + ex.Message);
            }
        }
    }
}
