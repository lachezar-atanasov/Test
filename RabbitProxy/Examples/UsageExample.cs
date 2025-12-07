// File: UsageExample.cs
// This file demonstrates how to use the LeadParameterService.
// It is NOT part of the library - just a reference for consumers.

using RabbitProxy.Interfaces;
using RabbitProxy.Services;
using System;

namespace RabbitProxy.Examples
{
    /// <summary>
    /// Example usage of LeadParameterService.
    /// </summary>
    public static class UsageExample
    {
        public static void Main()
        {
            // Create the service instance
            // The service is thread-safe and can be reused across multiple calls
            ILeadParameterService service = new LeadParameterService();

            string allegroBaseUrl = "http://your-allegro-server.example.com";
            string product = "YourProduct";

            // Example 1: Get instrument IDs by product
            try
            {
                int[] instrumentIds = service.GetInstIdsByProduct(allegroBaseUrl, product);

                Console.WriteLine("Found {0} instrument IDs:", instrumentIds.Length);
                foreach (int id in instrumentIds)
                {
                    Console.WriteLine("  - {0}", id);
                }
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine("Invalid argument: {0}", ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine("Service call failed: {0}", ex.Message);
                if (ex.InnerException != null)
                {
                    Console.WriteLine("  Inner: {0}", ex.InnerException.Message);
                }
            }

            // Example 2: Get a parameter value
            try
            {
                string parameterKey = "SomeConfigKey";
                string value = service.GetParameter(allegroBaseUrl, product, parameterKey);

                if (string.IsNullOrEmpty(value))
                {
                    Console.WriteLine("Parameter '{0}' not found or empty.", parameterKey);
                }
                else
                {
                    Console.WriteLine("Parameter '{0}' = '{1}'", parameterKey, value);
                }
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine("Invalid argument: {0}", ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine("Service call failed: {0}", ex.Message);
            }
        }
    }
}
