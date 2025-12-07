// File: RabbitProxy/Services/LeadParameterService.cs
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Xml;
using log4net;
using RabbitProxy.Interfaces;

namespace RabbitProxy.Services
{
    /// <summary>
    /// Service for retrieving LEAD instrument and parameter data via HTTP.
    /// </summary>
    public class LeadParameterService : ILeadParameterService
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(LeadParameterService));

        private const int GetInstIdsTimeoutMs = 15000;
        private const int GetParameterTimeoutMs = 10000;
        private const string XmlNamespace = "http://allegrodevelopment.com/";

        /// <summary>
        /// Gets instrument IDs for a given product.
        /// </summary>
        /// <param name="allegroBaseUrl">Base URL of the Allegro web services.</param>
        /// <param name="product">Product name to query.</param>
        /// <returns>Array of instrument IDs, or empty array if none found.</returns>
        /// <exception cref="ArgumentException">Thrown if parameters are invalid.</exception>
        /// <exception cref="InvalidOperationException">Thrown if the request fails.</exception>
        public int[] GetInstIdsByProduct(string allegroBaseUrl, string product)
        {
            if (string.IsNullOrWhiteSpace(allegroBaseUrl))
            {
                throw new ArgumentException("allegroBaseUrl is required", "allegroBaseUrl");
            }

            if (string.IsNullOrWhiteSpace(product))
            {
                throw new ArgumentException("product is required", "product");
            }

            string baseUrl = allegroBaseUrl.TrimEnd('/');
            string requestUrl = string.Format("{0}/LEADInstruments.asmx/GetInstIdsByProduct", baseUrl);
            string postData = string.Format("product={0}", UrlEncode(product));

            Log.Debug(string.Format("GetInstIdsByProduct: {0}", requestUrl));

            try
            {
                string xml = PostRequest(requestUrl, postData, GetInstIdsTimeoutMs);

                if (string.IsNullOrWhiteSpace(xml))
                {
                    Log.Debug("GetInstIdsByProduct: empty response");
                    return new int[0];
                }

                var doc = new XmlDocument();
                doc.LoadXml(xml);

                return ParseInstIds(doc);
            }
            catch (WebException ex)
            {
                string message = string.Format(
                    "GetInstIdsByProduct failed calling '{0}'", requestUrl);
                Log.Error(message, ex);
                throw new InvalidOperationException(message, ex);
            }
            catch (XmlException ex)
            {
                string message = string.Format(
                    "GetInstIdsByProduct returned invalid XML from '{0}'", requestUrl);
                Log.Error(message, ex);
                throw new InvalidOperationException(message, ex);
            }
        }

        /// <summary>
        /// Gets a parameter value by product and key.
        /// </summary>
        /// <param name="allegroBaseUrl">Base URL of the Allegro web services.</param>
        /// <param name="product">Product name.</param>
        /// <param name="key">Parameter key.</param>
        /// <returns>Parameter value, or empty string if not found.</returns>
        /// <exception cref="ArgumentException">Thrown if parameters are invalid.</exception>
        /// <exception cref="InvalidOperationException">Thrown if the request fails.</exception>
        public string GetParameter(string allegroBaseUrl, string product, string key)
        {
            if (string.IsNullOrWhiteSpace(allegroBaseUrl))
            {
                throw new ArgumentException("allegroBaseUrl is required", "allegroBaseUrl");
            }

            if (string.IsNullOrWhiteSpace(product))
            {
                throw new ArgumentException("product is required", "product");
            }

            if (string.IsNullOrWhiteSpace(key))
            {
                throw new ArgumentException("key is required", "key");
            }

            string baseUrl = allegroBaseUrl.TrimEnd('/');
            string requestUrl = string.Format("{0}/AllegroWebServices/LEADParameters.asmx/GetParameter", baseUrl);

            // FIX: URL-encode both parameters to handle special characters
            string postData = string.Format("product={0}&key={1}",
                UrlEncode(product),
                UrlEncode(key));

            Log.Debug(string.Format("GetParameter: {0} (product={1}, key={2})", requestUrl, product, key));

            try
            {
                string xml = PostRequest(requestUrl, postData, GetParameterTimeoutMs);

                if (string.IsNullOrWhiteSpace(xml))
                {
                    Log.Debug("GetParameter: empty response");
                    return string.Empty;
                }

                var doc = new XmlDocument();
                doc.LoadXml(xml);

                if (doc.DocumentElement == null)
                {
                    return string.Empty;
                }

                return doc.DocumentElement.InnerText ?? string.Empty;
            }
            catch (WebException ex)
            {
                string message = string.Format(
                    "GetParameter failed calling '{0}'", requestUrl);
                Log.Error(message, ex);
                throw new InvalidOperationException(message, ex);
            }
            catch (XmlException ex)
            {
                string message = string.Format(
                    "GetParameter returned invalid XML from '{0}'", requestUrl);
                Log.Error(message, ex);
                throw new InvalidOperationException(message, ex);
            }
        }

        /// <summary>
        /// URL-encodes a string value for use in form data.
        /// </summary>
        private static string UrlEncode(string value)
        {
            if (string.IsNullOrEmpty(value))
                return string.Empty;

            // WebUtility.UrlEncode is available in .NET Framework 4+
            return WebUtility.UrlEncode(value);
        }

        /// <summary>
        /// Performs an HTTP POST request and returns the response body.
        /// </summary>
        private static string PostRequest(string url, string postData, int timeoutMs)
        {
            byte[] dataBytes = Encoding.UTF8.GetBytes(postData);

            var request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = dataBytes.Length;
            request.Credentials = CredentialCache.DefaultNetworkCredentials;
            request.PreAuthenticate = false;
            request.Timeout = timeoutMs;
            request.ReadWriteTimeout = timeoutMs;

            // Write request body
            using (Stream requestStream = request.GetRequestStream())
            {
                requestStream.Write(dataBytes, 0, dataBytes.Length);
            }

            // Read response
            using (var response = (HttpWebResponse)request.GetResponse())
            {
                Stream responseStream = response.GetResponseStream();

                if (responseStream == null)
                {
                    Log.Warn("Response stream is null for: " + url);
                    return string.Empty;
                }

                using (var reader = new StreamReader(responseStream, Encoding.UTF8))
                {
                    return reader.ReadToEnd();
                }
            }
        }

        /// <summary>
        /// Parses instrument IDs from the XML response.
        /// </summary>
        private static int[] ParseInstIds(XmlDocument doc)
        {
            var nsmgr = new XmlNamespaceManager(doc.NameTable);
            nsmgr.AddNamespace("ns", XmlNamespace);

            XmlNodeList nodes = doc.SelectNodes("//ns:int", nsmgr);

            if (nodes == null || nodes.Count == 0)
            {
                return new int[0];
            }

            var validIds = new List<int>(nodes.Count);

            foreach (XmlNode node in nodes)
            {
                int id;
                if (int.TryParse(node.InnerText, out id))
                {
                    validIds.Add(id);
                }
            }

            return validIds.ToArray();
        }
    }
}
