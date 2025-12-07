// File: ILeadParameterService.cs
using System;

namespace RabbitProxy.Interfaces
{
    /// <summary>
    /// Service interface for retrieving LEAD instrument IDs and parameters
    /// from Allegro web services.
    /// </summary>
    public interface ILeadParameterService
    {
        /// <summary>
        /// Retrieves instrument IDs for a given product from the LEAD Instruments service.
        /// </summary>
        /// <param name="allegroBaseUrl">The base URL of the Allegro server (e.g., "http://server").</param>
        /// <param name="product">The product identifier to query.</param>
        /// <returns>An array of instrument IDs; empty array if none found.</returns>
        /// <exception cref="ArgumentException">Thrown when allegroBaseUrl or product is null/empty.</exception>
        /// <exception cref="InvalidOperationException">Thrown when the HTTP request fails or returns invalid XML.</exception>
        int[] GetInstIdsByProduct(string allegroBaseUrl, string product);

        /// <summary>
        /// Retrieves a parameter value for a given product and key from the LEAD Parameters service.
        /// </summary>
        /// <param name="allegroBaseUrl">The base URL of the Allegro server (e.g., "http://server").</param>
        /// <param name="product">The product identifier.</param>
        /// <param name="key">The parameter key to retrieve.</param>
        /// <returns>The parameter value; empty string if not found or null.</returns>
        /// <exception cref="ArgumentException">Thrown when allegroBaseUrl is null/empty.</exception>
        /// <exception cref="InvalidOperationException">Thrown when the HTTP request fails or returns invalid XML.</exception>
        string GetParameter(string allegroBaseUrl, string product, string key);
    }
}
