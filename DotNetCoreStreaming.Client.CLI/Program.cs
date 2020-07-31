using System;
using System.IO;
using System.Net.Http;
using System.Threading;

namespace DotNetCoreStreaming.Consumer
{
    class Program
    {
        static void Main(string[] args)
        {

            using (var httpClientHandler = new HttpClientHandler())
            {

                httpClientHandler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => { return true; };

                using (HttpClient httpClient = new HttpClient(httpClientHandler))
                {

                    httpClient.Timeout = TimeSpan.FromMilliseconds(Timeout.Infinite);
                    var requestUri = "http://localhost:5000/api/Cliente/Streaming"; //60596
                    var stream = httpClient.GetStreamAsync(requestUri).Result;

                    using (var reader = new StreamReader(stream))
                    {
                        while (!reader.EndOfStream)
                        {
                            Console.WriteLine(reader.ReadLine());
                        }
                    }
                }
            }
        }
    }
}
