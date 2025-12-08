using RabbitProxy.Interfaces;
using log4net;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Xml;

namespace RabbitProxy.Services
{
    public class LeadParameterService : ILeadParameterService
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(LeadParameterService));

        private const int GetInstIdsTimeoutMs = 15000;
        private const int GetParameterTimeoutMs = 10000;

        public int[] GetInstIdsByProduct(string allegroBaseUrl, string product)
        {
            if (string.IsNullOrWhiteSpace(allegroBaseUrl))
            {
                throw new ArgumentException("allegroBaseUrl is required", nameof(allegroBaseUrl));
            }

            if (string.IsNullOrWhiteSpace(product))
            {
                throw new ArgumentException("product is required", nameof(product));
            }

            string baseUrl = allegroBaseUrl.TrimEnd('/');
            string requestUrl = string.Format("{0}/LEADInstruments.asmx/GetInstIdsByProduct", baseUrl);
            string postData = string.Format("product={0}", WebUtility.UrlEncode(product));

            try
            {
                string xml = PostRequest(requestUrl, postData, GetInstIdsTimeoutMs);

                if (string.IsNullOrWhiteSpace(xml))
                {
                    return new int[0];
                }

                XmlDocument doc = new XmlDocument();
                doc.LoadXml(xml);

                return ParseInstIds(doc);
            }
            catch (WebException ex)
            {
                throw new InvalidOperationException(
                    string.Format("LeadInstrumentService.GetInstIdsByProduct failed calling '{0}'", requestUrl), ex);
            }
            catch (XmlException ex)
            {
                throw new InvalidOperationException(
                    string.Format("LeadInstrumentService.GetInstIdsByProduct returned invalid XML from '{0}'", requestUrl), ex);
            }
        }

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
                string xml = PostRequest(requestUrl, postData, GetParameterTimeoutMs);

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

        private static string PostRequest(string url, string postData, int timeoutMs)
        {
            byte[] dataBytes = Encoding.UTF8.GetBytes(postData);

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = dataBytes.Length;
            request.Credentials = CredentialCache.DefaultNetworkCredentials;
            request.PreAuthenticate = false;
            request.Timeout = timeoutMs;
            request.ReadWriteTimeout = timeoutMs;

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

        private static int[] ParseInstIds(XmlDocument doc)
        {
            XmlNamespaceManager nsmgr = new XmlNamespaceManager(doc.NameTable);
            nsmgr.AddNamespace("ns", "http://allegrodevelopment.com/");

            XmlNodeList nodes = doc.SelectNodes("//ns:int", nsmgr);

            if (nodes == null || nodes.Count == 0)
            {
                return new int[0];
            }

            List<int> validIds = new List<int>();

            foreach (XmlNode node in nodes)
            {
                string nodeText = node.InnerText;

                if (string.IsNullOrWhiteSpace(nodeText))
                {
                    Log.Warn("Skipping empty InstId node");
                    continue;
                }

                int id;
                if (!int.TryParse(nodeText, out id))
                {
                    Log.Warn("Skipping invalid InstId value: " + nodeText);
                    continue;
                }

                if (id <= 0)
                {
                    Log.Warn("Skipping non-positive InstId: " + id);
                    continue;
                }

                validIds.Add(id);
            }

            return validIds.ToArray();
        }
    }
}
