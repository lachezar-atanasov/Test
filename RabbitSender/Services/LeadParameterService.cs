using RabbitSender.Interfaces;
using System;
using System.IO;
using System.Net;
using System.Text;
using System.Xml;

namespace RabbitSender.Services
{
    public class LeadParameterService : ILeadParameterService
    {
        private const int TimeoutMs = 10000;

        public string GetParameter(string allegroBaseUrl, string product, string key)
        {
            if (string.IsNullOrWhiteSpace(allegroBaseUrl))
            {
                throw new ArgumentException("allegroBaseUrl is required", nameof(allegroBaseUrl));
            }

            string baseUrl = allegroBaseUrl.TrimEnd('/');
            string requestUrl = string.Format("{0}/AllegroWebServices/LEADParameters.asmx/GetParameter", baseUrl);
            string postData = string.Format("product={0}&key={1}", product, key);

            try
            {
                string xml = PostRequest(requestUrl, postData);

                if (string.IsNullOrWhiteSpace(xml))
                {
                    return string.Empty;
                }

                XmlDocument doc = new XmlDocument();
                doc.LoadXml(xml);

                if (doc.DocumentElement == null)
                {
                    return string.Empty;
                }

                return doc.DocumentElement.InnerText ?? string.Empty;
            }
            catch (WebException ex)
            {
                throw new InvalidOperationException(
                    string.Format("LeadParameterService.GetParameter failed calling '{0}'", requestUrl), ex);
            }
        }

        private static string PostRequest(string url, string postData)
        {
            byte[] dataBytes = Encoding.UTF8.GetBytes(postData);

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = dataBytes.Length;
            request.Credentials = CredentialCache.DefaultNetworkCredentials;
            request.Timeout = TimeoutMs;
            request.ReadWriteTimeout = TimeoutMs;

            using (Stream stream = request.GetRequestStream())
            {
                stream.Write(dataBytes, 0, dataBytes.Length);
            }

            using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
            using (StreamReader reader = new StreamReader(response.GetResponseStream(), Encoding.UTF8))
            {
                return reader.ReadToEnd();
            }
        }
    }
}
