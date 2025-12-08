using System;
using System.IO;
using System.Net;
using System.Text;
using log4net;
using RabbitProxy.Interfaces;

namespace RabbitProxy.Services
{
    public class UniversalLoaderService : IUniversalLoaderService
    {
        private static readonly ILog Log = LogManager.GetLogger(typeof(UniversalLoaderService));
        private readonly ILeadParameterService _leadParameterService;

        public UniversalLoaderService() : this(new LeadParameterService())
        {
        }

        public UniversalLoaderService(ILeadParameterService leadParameterService)
        {
            _leadParameterService = leadParameterService;
        }

        public bool UploadToUniversalLoader(string allegroUrl, string xmlData, string configurationName)
        {
            try
            {
                string ulBaseUrl = _leadParameterService.GetParameter(allegroUrl, "UniversalLoader", "URL");
                if (string.IsNullOrWhiteSpace(ulBaseUrl))
                {
                    Log.Error("UniversalLoader URL parameter is empty or not configured");
                    return false;
                }

                string ulUrl = new Uri(new Uri(ulBaseUrl), "UniversalLoader/UniversalLoaderservice.asmx").ToString();

                string soapEnvelope =
                    "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
                    "<soap12:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\">" +
                    "<soap12:Body>" +
                    "<ImportFileConfigured xmlns=\"http://tempuri.org/\">" +
                    "<allegroURL>" + SecurityElement.Escape(allegroUrl) + "</allegroURL>" +
                    "<configurationName>" + SecurityElement.Escape(configurationName) + "</configurationName>" +
                    "<fileLoaderConfig>" +
                    "<Data>" + Convert.ToBase64String(Encoding.UTF8.GetBytes(xmlData)) + "</Data>" +
                    "<FileFormat>XML</FileFormat>" +
                    "<TransformationOutputFilePath></TransformationOutputFilePath>" +
                    "<CSVSeparator></CSVSeparator>" +
                    "</fileLoaderConfig>" +
                    "</ImportFileConfigured>" +
                    "</soap12:Body>" +
                    "</soap12:Envelope>";

                var request = (HttpWebRequest)WebRequest.Create(ulUrl);
                request.Method = "POST";
                request.ContentType = "application/soap+xml; charset=utf-8";
                request.Credentials = CredentialCache.DefaultNetworkCredentials;
                request.PreAuthenticate = true;
                request.Timeout = 1800000;

                byte[] soapBytes = Encoding.UTF8.GetBytes(soapEnvelope);

                using (var stream = request.GetRequestStream())
                {
                    stream.Write(soapBytes, 0, soapBytes.Length);
                }

                using (var response = (HttpWebResponse)request.GetResponse())
                using (var reader = new StreamReader(response.GetResponseStream()))
                {
                    Log.Info("Upload successful. Response: " + reader.ReadToEnd());
                }

                return true;
            }
            catch (Exception ex)
            {
                Log.Error("Universal Loader upload failed", ex);
                return false;
            }
        }
    }
}
