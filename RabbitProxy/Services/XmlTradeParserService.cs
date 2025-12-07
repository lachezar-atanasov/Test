// File: RabbitProxy/Services/XmlTradeParserService.cs
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Xml;
using System.Xml.Linq;
using log4net;

namespace RabbitProxy.Services
{
    /// <summary>
    /// Service for parsing trade messages from XML format.
    /// </summary>
    public class XmlTradeParserService
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(XmlTradeParserService));

        /// <summary>
        /// Converts a collection of trade messages to a combined XML document.
        /// </summary>
        /// <param name="messages">Trade messages in XML format.</param>
        /// <returns>Combined XML string, or empty string if no valid trades.</returns>
        public string ConvertMessagesToXml(IEnumerable<string> messages)
        {
            return ConvertMessagesToXmlFiltered(messages, null);
        }

        /// <summary>
        /// Converts a collection of trade messages to XML, filtering by allowed instrument IDs.
        /// </summary>
        /// <param name="messages">Trade messages in XML format.</param>
        /// <param name="allowedInstIds">Set of allowed instrument IDs (null = allow all).</param>
        /// <returns>Combined XML string, or empty string if no valid trades.</returns>
        public string ConvertMessagesToXmlFiltered(IEnumerable<string> messages, HashSet<int> allowedInstIds)
        {
            if (messages == null)
            {
                return string.Empty;
            }

            var sb = new StringBuilder();
            bool hasValidTrade = false;

            var writerSettings = new XmlWriterSettings
            {
                Indent = true,
                Encoding = Encoding.UTF8,
                OmitXmlDeclaration = false
            };

            using (var stringWriter = new Utf8StringWriter(sb))
            using (var xmlWriter = XmlWriter.Create(stringWriter, writerSettings))
            {
                xmlWriter.WriteStartDocument();
                xmlWriter.WriteStartElement("trades");

                foreach (string message in messages)
                {
                    if (string.IsNullOrWhiteSpace(message))
                    {
                        continue;
                    }

                    bool messageProcessed = ProcessMessage(message, allowedInstIds, xmlWriter);

                    if (messageProcessed)
                    {
                        hasValidTrade = true;
                    }
                }

                xmlWriter.WriteEndElement(); // </trades>
                xmlWriter.WriteEndDocument();
                xmlWriter.Flush();
            }

            return hasValidTrade ? sb.ToString() : string.Empty;
        }

        private bool ProcessMessage(string message, HashSet<int> allowedInstIds, XmlWriter xmlWriter)
        {
            try
            {
                string sanitized = SanitizeXmlMessage(message);

                // Wrap in root element to handle multiple trades in one message
                XDocument doc = XDocument.Parse("<root>" + sanitized + "</root>");

                bool anyTradeWritten = false;

                foreach (XElement trade in doc.Descendants("trade"))
                {
                    if (allowedInstIds == null)
                    {
                        // No filter - include all trades
                        trade.WriteTo(xmlWriter);
                        anyTradeWritten = true;
                    }
                    else
                    {
                        // Check instrument ID filter
                        if (TradeMatchesFilter(trade, allowedInstIds))
                        {
                            trade.WriteTo(xmlWriter);
                            anyTradeWritten = true;
                        }
                    }
                }

                return anyTradeWritten;
            }
            catch (XmlException ex)
            {
                Log.Warn("Invalid trade XML message skipped: " + ex.Message);
                return false;
            }
            catch (Exception ex)
            {
                Log.Error("Error processing trade message", ex);
                return false;
            }
        }

        private static string SanitizeXmlMessage(string message)
        {
            if (string.IsNullOrEmpty(message))
                return message;

            string result = message.Trim();

            // Remove XML declaration if present
            if (result.StartsWith("<?xml", StringComparison.OrdinalIgnoreCase))
            {
                int endIndex = result.IndexOf("?>", StringComparison.Ordinal);
                if (endIndex >= 0)
                {
                    result = result.Substring(endIndex + 2).TrimStart();
                }
            }

            return result;
        }

        private static bool TradeMatchesFilter(XElement trade, HashSet<int> allowedInstIds)
        {
            XElement instrumentIdNode = trade.Element("instrumentId");

            if (instrumentIdNode == null)
            {
                return false;
            }

            string instrumentIdText = instrumentIdNode.Value.Trim();

            if (string.IsNullOrEmpty(instrumentIdText))
            {
                return false;
            }

            // Handle K-prefixed instrument IDs (e.g., "K123" -> 123)
            string numericPart = instrumentIdText.StartsWith("K", StringComparison.OrdinalIgnoreCase)
                ? instrumentIdText.Substring(1)
                : instrumentIdText;

            int instrumentId;
            if (int.TryParse(numericPart, out instrumentId))
            {
                return allowedInstIds.Contains(instrumentId);
            }

            return false;
        }

        /// <summary>
        /// Extracts the trade ID from a trade XML message.
        /// </summary>
        /// <param name="xml">Trade XML message.</param>
        /// <returns>Trade ID, or null if not found or invalid.</returns>
        public string ExtractTradeId(string xml)
        {
            if (string.IsNullOrWhiteSpace(xml))
            {
                return null;
            }

            try
            {
                XDocument doc = XDocument.Parse(xml);

                if (doc.Root == null)
                {
                    return null;
                }

                // Try both casing variants
                XElement tradeIdElement = doc.Root.Element("TradeId")
                                       ?? doc.Root.Element("tradeId");

                return tradeIdElement != null ? tradeIdElement.Value : null;
            }
            catch (XmlException ex)
            {
                Log.Warn("Failed to extract TradeId - invalid XML: " + ex.Message);
                return null;
            }
            catch (Exception ex)
            {
                Log.Error("Failed to extract TradeId from XML", ex);
                return null;
            }
        }

        /// <summary>
        /// StringWriter that reports UTF-8 encoding instead of UTF-16.
        /// Required for XmlWriter to generate correct XML declaration.
        /// </summary>
        private class Utf8StringWriter : StringWriter
        {
            public Utf8StringWriter(StringBuilder sb) : base(sb)
            {
            }

            public override Encoding Encoding
            {
                get { return Encoding.UTF8; }
            }
        }
    }
}
