<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="RabbitSender.Default" %>
<!DOCTYPE html>
<html>
<head>
    <title>RabbitMQ Sender</title>
</head>
<body>
    <h2>RabbitMQ Sender</h2>
    <form id="form1" runat="server">
        <p>
            <label>Queue (leave empty for default):</label><br/>
            <asp:TextBox ID="txtQueue" runat="server" Width="400px"></asp:TextBox>
        </p>
        <p>
            <label>Message:</label><br/>
            <asp:TextBox ID="txtMessage" runat="server" TextMode="MultiLine" Rows="10" Width="400px"></asp:TextBox>
        </p>
        <p>
            <asp:Button ID="btnSend" runat="server" Text="Send" OnClick="btnSend_Click" />
        </p>
        <p>
            <asp:Label ID="lblResult" runat="server" Text=""></asp:Label>
        </p>
    </form>
</body>
</html>
