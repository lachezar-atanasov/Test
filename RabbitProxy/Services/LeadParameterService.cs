// File: LeadParameterService.cs
using RabbitProxy.Interfaces;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Xml;

namespace RabbitProxy.Services
{
    /// <summary>
    /// Service for retrieving LEAD instrument IDs and parameters from Allegro ASMX web services.
    /// Thread-safe for concurrent use.
    /// </summary>
    public class LeadParameterService : ILeadParameterService
    {
        // Timeouts for different operations
        private const int GetInstIdsTimeoutMs = 15000;
        private const int GetParameterTimeoutMs = 10000;

        // XML namespace used by Allegro web services
        private const string AllegroNamespace = "http://allegrodevelopment.com/";

        /// <summary>
        /// Retrieves instrument IDs for a given product from the LEAD Instruments service.
        /// </summary>
        /// <param name="allegroBaseUrl">The base URL of the Allegro server.</param>
        /// <param name="product">The product identifier to query.</param>
        /// <returns>An array of instrument IDs; empty array if none found.</returns>
        public int[] GetInstIdsByProduct(string allegroBaseUrl, string product)
        {
            ValidateRequiredParameter(allegroBaseUrl, "allegroBaseUrl");
            ValidateRequiredParameter(product, "product");

            string baseUrl = allegroBaseUrl.TrimEnd('/');
            string requestUrl = string.Format("{0}/LEADInstruments.asmx/GetInstIdsByProduct", baseUrl);
            string postData = string.Format("product={0}", UrlEncode(product));

            try
            {
                string xml = PostRequest(requestUrl, postData, GetInstIdsTimeoutMs);

                if (string.IsNullOrEmpty(xml))
                {
                    return new int[0];
                }

                return ParseInstIds(xml);
            }
            catch (WebException ex)
            {
                throw new InvalidOperationException(
                    string.Format("LeadParameterService.GetInstIdsByProduct failed calling '{0}'", requestUrl), ex);
            }
            catch (XmlException ex)
            {
                throw new InvalidOperationException(
                    string.Format("LeadParameterService.GetInstIdsByProduct returned invalid XML from '{0}'", requestUrl), ex);
            }
        }

        /// <summary>
        /// Retrieves a parameter value for a given product and key from the LEAD Parameters service.
        /// </summary>
        /// <param name="allegroBaseUrl">The base URL of the Allegro server.</param>
        /// <param name="product">The product identifier.</param>
        /// <param name="key">The parameter key to retrieve.</param>
        /// <returns>The parameter value; empty string if not found.</returns>
        public string GetParameter(string allegroBaseUrl, string product, string key)
        {
            ValidateRequiredParameter(allegroBaseUrl, "allegroBaseUrl");

            string baseUrl = allegroBaseUrl.TrimEnd('/');
            string requestUrl = string.Format("{0}/AllegroWebServices/LEADParameters.asmx/GetParameter", baseUrl);
            
            // URL-encode both product and key to prevent injection and handle special characters
            string postData = string.Format("product={0}&key={1}", UrlEncode(product), UrlEncode(key));

            try
            {
                string xml = PostRequest(requestUrl, postData, GetParameterTimeoutMs);

                if (string.IsNullOrEmpty(xml))
                {
                    return string.Empty;
                }

                return ParseParameterValue(xml);
            }
            catch (WebException ex)
            {
                throw new InvalidOperationException(
                    string.Format("LeadParameterService.GetParameter failed calling '{0}'", requestUrl), ex);
            }
            catch (XmlException ex)
            {
                throw new InvalidOperationException(
                    string.Format("LeadParameterService.GetParameter returned invalid XML from '{0}'", requestUrl), ex);
            }
        }

        /// <summary>
        /// Makes an HTTP POST request and returns the response body.
        /// </summary>
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

            // Write request body
            using (Stream requestStream = request.GetRequestStream())
            {
                requestStream.Write(dataBytes, 0, dataBytes.Length);
            }

            // Read response
            using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
            {
                Stream responseStream = response.GetResponseStream();
                if (responseStream == null)
                {
                    return string.Empty;
                }

                using (StreamReader reader = new StreamReader(responseStream, Encoding.UTF8))
                {
                    return reader.ReadToEnd();
                }
            }
        }

        /// <summary>
        /// Parses instrument IDs from the XML response.
        /// </summary>
        private static int[] ParseInstIds(string xml)
        {
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(xml);

            XmlNamespaceManager nsmgr = new XmlNamespaceManager(doc.NameTable);
            nsmgr.AddNamespace("ns", AllegroNamespace);

            XmlNodeList nodes = doc.SelectNodes("//ns:int", nsmgr);

            if (nodes == null || nodes.Count == 0)
            {
                return new int[0];
            }

            List<int> validIds = new List<int>(nodes.Count);

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

        /// <summary>
        /// Parses the parameter value from the XML response.
        /// </summary>
        private static string ParseParameterValue(string xml)
        {
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(xml);

            if (doc.DocumentElement == null)
            {
                return string.Empty;
            }

            return doc.DocumentElement.InnerText ?? string.Empty;
        }

        /// <summary>
        /// Validates that a required parameter is not null or whitespace.
        /// </summary>
        private static void ValidateRequiredParameter(string value, string paramName)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException(string.Format("{0} is required", paramName), paramName);
            }
        }

        /// <summary>
        /// URL-encodes a string value. Handles null by returning empty string.
        /// Uses Uri.EscapeDataString for proper RFC 3986 encoding.
        /// </summary>
        private static string UrlEncode(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return string.Empty;
            }

            // Uri.EscapeDataString is available in .NET Framework 4 and properly encodes
            // all reserved characters according to RFC 3986
            return Uri.EscapeDataString(value);
        }
    }
}
