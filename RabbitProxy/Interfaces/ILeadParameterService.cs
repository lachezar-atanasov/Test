namespace RabbitProxy.Interfaces
{
	/// <summary>
	/// Service interface for retrieving lead parameters and instrument IDs from Allegro web services.
	/// </summary>
	public interface ILeadParameterService
	{
		/// <summary>
		/// Retrieves instrument IDs for a given product from the Allegro LEADInstruments service.
		/// </summary>
		/// <param name="allegroBaseUrl">The base URL of the Allegro service (must not be null or empty).</param>
		/// <param name="product">The product name to query (must not be null or empty).</param>
		/// <returns>An array of instrument IDs, or an empty array if none are found.</returns>
		/// <exception cref="System.ArgumentException">Thrown when allegroBaseUrl or product is null or empty.</exception>
		/// <exception cref="System.InvalidOperationException">Thrown when the web service call fails or returns invalid data.</exception>
		int[] GetInstIdsByProduct(string allegroBaseUrl, string product);

		/// <summary>
		/// Retrieves a parameter value for a given product and key from the Allegro LEADParameters service.
		/// </summary>
		/// <param name="allegroBaseUrl">The base URL of the Allegro service (must not be null or empty).</param>
		/// <param name="product">The product name (must not be null or empty).</param>
		/// <param name="key">The parameter key to retrieve (must not be null or empty).</param>
		/// <returns>The parameter value, or an empty string if not found.</returns>
		/// <exception cref="System.ArgumentException">Thrown when allegroBaseUrl, product, or key is null or empty.</exception>
		/// <exception cref="System.InvalidOperationException">Thrown when the web service call fails.</exception>
		string GetParameter(string allegroBaseUrl, string product, string key);
	}
}
