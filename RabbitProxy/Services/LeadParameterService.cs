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
	/// Production-ready service for retrieving lead parameters and instrument IDs from Allegro web services.
	/// Implements proper error handling, resource disposal, and .NET Framework 4 compatibility.
	/// </summary>
	public class LeadParameterService : ILeadParameterService
	{
		private const int GetInstIdsTimeoutMs = 15000;
		private const int GetParameterTimeoutMs = 10000;
		private const string LeadInstrumentsEndpoint = "/LEADInstruments.asmx/GetInstIdsByProduct";
		private const string LeadParametersEndpoint = "/AllegroWebServices/LEADParameters.asmx/GetParameter";
		private const string XmlNamespace = "http://allegrodevelopment.com/";
		private const string XmlNamespacePrefix = "ns";

		/// <summary>
		/// Retrieves instrument IDs for a given product from the Allegro LEADInstruments service.
		/// </summary>
		/// <param name="allegroBaseUrl">The base URL of the Allegro service (must not be null or empty).</param>
		/// <param name="product">The product name to query (must not be null or empty).</param>
		/// <returns>An array of instrument IDs, or an empty array if none are found.</returns>
		/// <exception cref="ArgumentException">Thrown when allegroBaseUrl or product is null or empty.</exception>
		/// <exception cref="InvalidOperationException">Thrown when the web service call fails or returns invalid data.</exception>
		public int[] GetInstIdsByProduct(string allegroBaseUrl, string product)
		{
			if (string.IsNullOrWhiteSpace(allegroBaseUrl))
			{
				throw new ArgumentException("allegroBaseUrl is required and cannot be null or empty.", nameof(allegroBaseUrl));
			}

			if (string.IsNullOrWhiteSpace(product))
			{
				throw new ArgumentException("product is required and cannot be null or empty.", nameof(product));
			}

			string baseUrl = allegroBaseUrl.TrimEnd('/');
			string requestUrl = string.Format("{0}{1}", baseUrl, LeadInstrumentsEndpoint);
			string postData = string.Format("product={0}", Uri.EscapeDataString(product));

			try
			{
				string xml = PostRequest(requestUrl, postData, GetInstIdsTimeoutMs);

				if (string.IsNullOrWhiteSpace(xml))
				{
					return new int[0];
				}

				return ParseInstIds(xml);
			}
			catch (WebException ex)
			{
				string errorMessage = string.Format(
					"LeadParameterService.GetInstIdsByProduct failed calling '{0}'. Status: {1}",
					requestUrl,
					ex.Status);

				// Include response details if available
				if (ex.Response != null)
				{
					using (var responseStream = ex.Response.GetResponseStream())
					{
						if (responseStream != null)
						{
							using (var reader = new StreamReader(responseStream, Encoding.UTF8))
							{
								string responseBody = reader.ReadToEnd();
								if (!string.IsNullOrWhiteSpace(responseBody))
								{
									errorMessage = string.Format("{0} Response: {1}", errorMessage, responseBody);
								}
							}
						}
					}
				}

				throw new InvalidOperationException(errorMessage, ex);
			}
			catch (XmlException ex)
			{
				throw new InvalidOperationException(
					string.Format("LeadParameterService.GetInstIdsByProduct returned invalid XML from '{0}'. Error: {1}", requestUrl, ex.Message),
					ex);
			}
			catch (Exception ex)
			{
				// Catch any other unexpected exceptions and wrap them
				throw new InvalidOperationException(
					string.Format("LeadParameterService.GetInstIdsByProduct encountered an unexpected error calling '{0}'", requestUrl),
					ex);
			}
		}

		/// <summary>
		/// Retrieves a parameter value for a given product and key from the Allegro LEADParameters service.
		/// </summary>
		/// <param name="allegroBaseUrl">The base URL of the Allegro service (must not be null or empty).</param>
		/// <param name="product">The product name (must not be null or empty).</param>
		/// <param name="key">The parameter key to retrieve (must not be null or empty).</param>
		/// <returns>The parameter value, or an empty string if not found.</returns>
		/// <exception cref="ArgumentException">Thrown when allegroBaseUrl, product, or key is null or empty.</exception>
		/// <exception cref="InvalidOperationException">Thrown when the web service call fails.</exception>
		public string GetParameter(string allegroBaseUrl, string product, string key)
		{
			if (string.IsNullOrWhiteSpace(allegroBaseUrl))
			{
				throw new ArgumentException("allegroBaseUrl is required and cannot be null or empty.", nameof(allegroBaseUrl));
			}

			if (string.IsNullOrWhiteSpace(product))
			{
				throw new ArgumentException("product is required and cannot be null or empty.", nameof(product));
			}

			if (string.IsNullOrWhiteSpace(key))
			{
				throw new ArgumentException("key is required and cannot be null or empty.", nameof(key));
			}

			string baseUrl = allegroBaseUrl.TrimEnd('/');
			string requestUrl = string.Format("{0}{1}", baseUrl, LeadParametersEndpoint);
			string postData = string.Format("product={0}&key={1}", Uri.EscapeDataString(product), Uri.EscapeDataString(key));

			try
			{
				string xml = PostRequest(requestUrl, postData, GetParameterTimeoutMs);

				if (string.IsNullOrWhiteSpace(xml))
				{
					return string.Empty;
				}

				return ParseParameterValue(xml);
			}
			catch (WebException ex)
			{
				string errorMessage = string.Format(
					"LeadParameterService.GetParameter failed calling '{0}'. Status: {1}",
					requestUrl,
					ex.Status);

				// Include response details if available
				if (ex.Response != null)
				{
					using (var responseStream = ex.Response.GetResponseStream())
					{
						if (responseStream != null)
						{
							using (var reader = new StreamReader(responseStream, Encoding.UTF8))
							{
								string responseBody = reader.ReadToEnd();
								if (!string.IsNullOrWhiteSpace(responseBody))
								{
									errorMessage = string.Format("{0} Response: {1}", errorMessage, responseBody);
								}
							}
						}
					}
				}

				throw new InvalidOperationException(errorMessage, ex);
			}
			catch (XmlException ex)
			{
				throw new InvalidOperationException(
					string.Format("LeadParameterService.GetParameter returned invalid XML from '{0}'. Error: {1}", requestUrl, ex.Message),
					ex);
			}
			catch (Exception ex)
			{
				// Catch any other unexpected exceptions and wrap them
				throw new InvalidOperationException(
					string.Format("LeadParameterService.GetParameter encountered an unexpected error calling '{0}'", requestUrl),
					ex);
			}
		}

		/// <summary>
		/// Performs an HTTP POST request with proper resource disposal and error handling.
		/// </summary>
		/// <param name="url">The URL to POST to.</param>
		/// <param name="postData">The form-encoded POST data.</param>
		/// <param name="timeoutMs">The timeout in milliseconds.</param>
		/// <returns>The response body as a string.</returns>
		/// <exception cref="WebException">Thrown when the HTTP request fails.</exception>
		private static string PostRequest(string url, string postData, int timeoutMs)
		{
			if (string.IsNullOrWhiteSpace(url))
			{
				throw new ArgumentException("URL cannot be null or empty.", nameof(url));
			}

			if (postData == null)
			{
				throw new ArgumentNullException(nameof(postData));
			}

			if (timeoutMs <= 0)
			{
				throw new ArgumentException("Timeout must be greater than zero.", nameof(timeoutMs));
			}

			byte[] dataBytes = Encoding.UTF8.GetBytes(postData);

			HttpWebRequest request = null;
			HttpWebResponse response = null;

			try
			{
				request = (HttpWebRequest)WebRequest.Create(url);
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

				// Get response
				response = (HttpWebResponse)request.GetResponse();

				using (Stream responseStream = response.GetResponseStream())
				{
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
			finally
			{
				// Ensure response is disposed even if an exception occurs
				if (response != null)
				{
					response.Close();
					response.Dispose();
				}
			}
		}

		/// <summary>
		/// Parses instrument IDs from XML response.
		/// </summary>
		/// <param name="xml">The XML string to parse.</param>
		/// <returns>An array of valid instrument IDs.</returns>
		/// <exception cref="XmlException">Thrown when the XML is malformed.</exception>
		private static int[] ParseInstIds(string xml)
		{
			if (string.IsNullOrWhiteSpace(xml))
			{
				return new int[0];
			}

			XmlDocument doc = new XmlDocument();
			doc.LoadXml(xml);

			XmlNamespaceManager nsmgr = new XmlNamespaceManager(doc.NameTable);
			nsmgr.AddNamespace(XmlNamespacePrefix, XmlNamespace);

			XmlNodeList nodes = doc.SelectNodes(string.Format("//{0}:int", XmlNamespacePrefix), nsmgr);

			if (nodes == null || nodes.Count == 0)
			{
				return new int[0];
			}

			List<int> validIds = new List<int>(nodes.Count);

			foreach (XmlNode node in nodes)
			{
				if (node != null && !string.IsNullOrWhiteSpace(node.InnerText))
				{
					int id;
					if (int.TryParse(node.InnerText.Trim(), out id))
					{
						validIds.Add(id);
					}
				}
			}

			return validIds.ToArray();
		}

		/// <summary>
		/// Parses a parameter value from XML response.
		/// </summary>
		/// <param name="xml">The XML string to parse.</param>
		/// <returns>The parameter value, or an empty string if not found.</returns>
		/// <exception cref="XmlException">Thrown when the XML is malformed.</exception>
		private static string ParseParameterValue(string xml)
		{
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
	}
}
