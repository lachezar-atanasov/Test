namespace RabbitSender.Interfaces
{
    public interface ILeadParameterService
    {
        string GetParameter(string allegroBaseUrl, string product, string key);
    }
}
