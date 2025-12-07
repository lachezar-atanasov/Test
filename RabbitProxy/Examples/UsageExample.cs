// File: RabbitProxy/Examples/UsageExample.cs
// This file demonstrates how to use the refactored RabbitMQ services.
// NOTE: This is example code, not part of the production library.

using System;
using System.Threading;
using RabbitMQ.Client;
using log4net;
using RabbitProxy.Models;
using RabbitProxy.Services;

namespace RabbitProxy.Examples
{
    /// <summary>
    /// Example usage of the RabbitMQ message receiver service.
    /// </summary>
    public static class UsageExample
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(UsageExample));

        /// <summary>
        /// Basic example: Start consuming messages and handle them.
        /// </summary>
        public static void BasicConsumerExample()
        {
            // Configure connection parameters
            var parameters = new RabbitConnectionParams
            {
                ServerName = "rabbitmq.example.com",
                Port = 5672,
                Username = "guest",
                Password = "guest",
                VirtualHost = "/",
                QueueName = "my.trade.queue",
                PrefetchCount = 10,        // Process 10 messages at a time
                MaxConnectionRetries = 5,  // Retry 5 times before giving up
                RetryDelayMs = 5000,       // 5 seconds between retries
                Timeout = 30000            // 30 second connection timeout
            };

            // Create the receiver service
            using (var receiver = new RabbitMessageReceiverService())
            {
                // Start consuming with a message handler
                receiver.StartConsuming(parameters, (message, channel, deliveryTag) =>
                {
                    try
                    {
                        Console.WriteLine("Received: " + message);

                        // Process the message here...
                        ProcessMessage(message);

                        // Acknowledge successful processing
                        channel.BasicAck(deliveryTag, multiple: false);
                    }
                    catch (Exception ex)
                    {
                        Log.Error("Failed to process message", ex);

                        // Reject and requeue the message for retry
                        channel.BasicNack(deliveryTag, multiple: false, requeue: true);
                    }
                });

                Console.WriteLine("Consumer started. Press Enter to stop...");
                Console.ReadLine();

                // Stop consuming
                receiver.Stop();
            }
        }

        /// <summary>
        /// Example with SSL and shared connection holder.
        /// </summary>
        public static void SslConsumerWithSharedConnection()
        {
            var parameters = new RabbitConnectionParams
            {
                ServerName = "rabbitmq.example.com",
                Port = 5671,               // SSL port
                Username = "myuser",
                Password = "mypassword",
                VirtualHost = "/production",
                QueueName = "trades.incoming",
                SSLEnabled = true,
                ServerCN = "rabbitmq.example.com",  // Certificate CN
                PrefetchCount = 5
            };

            // Use a shared connection holder (useful for multiple consumers)
            using (var connectionHolder = new RabbitMQConnectionHolder())
            {
                connectionHolder.EnsureConnected(parameters);

                // Create multiple consumers sharing the same connection
                using (var receiver1 = new RabbitMessageReceiverService(connectionHolder))
                using (var receiver2 = new RabbitMessageReceiverService(connectionHolder))
                {
                    // Each receiver can consume from different queues
                    var params1 = CloneWithQueue(parameters, "trades.incoming");
                    var params2 = CloneWithQueue(parameters, "trades.outgoing");

                    receiver1.StartConsuming(params1, HandleTradeMessage);
                    receiver2.StartConsuming(params2, HandleTradeMessage);

                    Console.WriteLine("Both consumers started. Press Enter to stop...");
                    Console.ReadLine();
                }
            }
        }

        /// <summary>
        /// Example: Parse trade messages and filter by instrument.
        /// </summary>
        public static void TradeParserExample()
        {
            // Get allowed instrument IDs from LEAD service
            var leadService = new LeadParameterService();
            int[] instIds = leadService.GetInstIdsByProduct(
                "https://allegro.example.com",
                "MyProduct");

            Console.WriteLine("Found {0} instrument IDs", instIds.Length);

            // Convert to HashSet for filtering
            var allowedIds = new System.Collections.Generic.HashSet<int>(instIds);

            // Parse incoming trade messages
            var parser = new XmlTradeParserService();

            var messages = new[]
            {
                "<trade><instrumentId>K123</instrumentId><price>100.50</price></trade>",
                "<trade><instrumentId>456</instrumentId><price>200.00</price></trade>"
            };

            // Convert and filter
            string combinedXml = parser.ConvertMessagesToXmlFiltered(messages, allowedIds);

            if (!string.IsNullOrEmpty(combinedXml))
            {
                Console.WriteLine("Combined XML:\n" + combinedXml);
            }
        }

        /// <summary>
        /// Example: Full workflow with message processing.
        /// </summary>
        public static void FullWorkflowExample()
        {
            var parameters = new RabbitConnectionParams
            {
                ServerName = "localhost",
                Port = 5672,
                Username = "guest",
                Password = "guest",
                QueueName = "trade.updates",
                PrefetchCount = 10
            };

            var parser = new XmlTradeParserService();
            var processed = new System.Collections.Generic.List<string>();

            using (var receiver = new RabbitMessageReceiverService())
            {
                receiver.StartConsuming(parameters, (message, channel, deliveryTag) =>
                {
                    try
                    {
                        // Extract trade ID for logging
                        string tradeId = parser.ExtractTradeId(message);
                        Log.Info("Processing trade: " + (tradeId ?? "unknown"));

                        // Process the trade
                        ProcessMessage(message);
                        processed.Add(message);

                        // Acknowledge
                        channel.BasicAck(deliveryTag, false);
                    }
                    catch (Exception ex)
                    {
                        Log.Error("Trade processing failed", ex);

                        // Don't requeue if it's a permanent failure
                        bool isPermanentFailure = ex is FormatException;
                        channel.BasicNack(deliveryTag, false, requeue: !isPermanentFailure);
                    }
                });

                // Run for a while
                Thread.Sleep(TimeSpan.FromMinutes(5));

                receiver.Stop();
            }

            Console.WriteLine("Processed {0} messages", processed.Count);
        }

        // Helper methods

        private static void ProcessMessage(string message)
        {
            // Your business logic here
            Thread.Sleep(100); // Simulate work
        }

        private static void HandleTradeMessage(string message, IModel channel, ulong deliveryTag)
        {
            try
            {
                ProcessMessage(message);
                channel.BasicAck(deliveryTag, false);
            }
            catch
            {
                channel.BasicNack(deliveryTag, false, true);
            }
        }

        private static RabbitConnectionParams CloneWithQueue(
            RabbitConnectionParams source, string queueName)
        {
            return new RabbitConnectionParams
            {
                ServerName = source.ServerName,
                Port = source.Port,
                Username = source.Username,
                Password = source.Password,
                VirtualHost = source.VirtualHost,
                QueueName = queueName,
                SSLEnabled = source.SSLEnabled,
                ServerCN = source.ServerCN,
                PrefetchCount = source.PrefetchCount,
                Timeout = source.Timeout,
                MaxConnectionRetries = source.MaxConnectionRetries,
                RetryDelayMs = source.RetryDelayMs
            };
        }
    }
}
