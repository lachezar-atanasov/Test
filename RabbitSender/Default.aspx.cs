using System;
using System.Web.UI;

namespace RabbitSender
{
    public partial class Default : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                txtQueue.Text = WebApiApplication.Params?.QueueName ?? "";
            }
        }

        protected void btnSend_Click(object sender, EventArgs e)
        {
            try
            {
                string queue = string.IsNullOrWhiteSpace(txtQueue.Text) 
                    ? WebApiApplication.Params.QueueName 
                    : txtQueue.Text.Trim();

                string message = txtMessage.Text;

                if (string.IsNullOrWhiteSpace(message))
                {
                    lblResult.Text = "Error: Message is required";
                    lblResult.ForeColor = System.Drawing.Color.Red;
                    return;
                }

                WebApiApplication.Sender.Send(queue, message);

                lblResult.Text = "OK - sent to " + queue;
                lblResult.ForeColor = System.Drawing.Color.Green;
            }
            catch (Exception ex)
            {
                lblResult.Text = "Error: " + ex.Message;
                lblResult.ForeColor = System.Drawing.Color.Red;
            }
        }
    }
}
