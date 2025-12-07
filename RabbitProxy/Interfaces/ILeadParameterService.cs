// File: RabbitProxy/Interfaces/ILeadParameterService.cs
using System;

namespace RabbitProxy.Interfaces
{
    /// <summary>
    /// Service interface for retrieving LEAD instrument and parameter data.
    /// </summary>
    public interface ILeadParameterService
    {
        /// <summary>
        /// Gets instrument IDs for a given product.
        /// </summary>
        /// <param name="allegroBaseUrl">Base URL of the Allegro web services.</param>
        /// <param name="product">Product name to query.</param>
        /// <returns>Array of instrument IDs, or empty array if none found.</returns>
        int[] GetInstIdsByProduct(string allegroBaseUrl, string product);

        /// <summary>
        /// Gets a parameter value by product and key.
        /// </summary>
        /// <param name="allegroBaseUrl">Base URL of the Allegro web services.</param>
        /// <param name="product">Product name.</param>
        /// <param name="key">Parameter key.</param>
        /// <returns>Parameter value, or empty string if not found.</returns>
        string GetParameter(string allegroBaseUrl, string product, string key);
    }
}
