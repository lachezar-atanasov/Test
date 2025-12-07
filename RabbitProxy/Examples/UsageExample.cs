using RabbitProxy.Interfaces;
using RabbitProxy.Services;
using System;

namespace RabbitProxy.Examples
{
	/// <summary>
	/// Example usage of LeadParameterService.
	/// This demonstrates how to use the refactored service in a production environment.
	/// </summary>
	public class UsageExample
	{
		public static void ExampleUsage()
		{
			// Initialize the service
			ILeadParameterService service = new LeadParameterService();

			string allegroBaseUrl = "https://allegro.example.com";

			try
			{
				// Example 1: Get instrument IDs by product
				int[] instrumentIds = service.GetInstIdsByProduct(allegroBaseUrl, "MyProduct");
				
				Console.WriteLine("Found {0} instrument IDs:", instrumentIds.Length);
				foreach (int id in instrumentIds)
				{
					Console.WriteLine("  - Instrument ID: {0}", id);
				}

				// Example 2: Get a parameter value
				string parameterValue = service.GetParameter(allegroBaseUrl, "MyProduct", "MyParameterKey");
				
				if (!string.IsNullOrEmpty(parameterValue))
				{
					Console.WriteLine("Parameter value: {0}", parameterValue);
				}
				else
				{
					Console.WriteLine("Parameter not found or empty.");
				}
			}
			catch (ArgumentException ex)
			{
				// Handle invalid input parameters
				Console.WriteLine("Invalid argument: {0}", ex.Message);
			}
			catch (InvalidOperationException ex)
			{
				// Handle service call failures
				Console.WriteLine("Service call failed: {0}", ex.Message);
				if (ex.InnerException != null)
				{
					Console.WriteLine("Inner exception: {0}", ex.InnerException.Message);
				}
			}
		}
	}
}
