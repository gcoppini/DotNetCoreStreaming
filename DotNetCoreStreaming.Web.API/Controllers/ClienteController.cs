using DotNetCoreStreaming.Enums;
using DotNetCoreStreaming.Models;
using DotNetCoreStreaming.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Collections.Concurrent;
using System.IO;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace DotNetCoreStreaming.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Produces("application/json")]
    public class ClienteController : ControllerBase
    {
        /*
        private static readonly string[] Types = new[]
        {
            "add", "remove", "update", "message", "like", "dislike", "love"
        };
        var rng = new Random();
        var messageType = Types[rng.Next(Types.Length)];
        */


        private static ConcurrentBag<StreamWriter> _clients;

        static ClienteController()
        {
            _clients = new ConcurrentBag<StreamWriter>();
        }

        [HttpPost]
        public IActionResult Post(Cliente cliente)
        {
            PushEvent(cliente, EventTypeEnum.Add);
            return Ok();
        }

        [HttpPut]
        public IActionResult Put(Cliente cliente)
        {
            PushEvent(cliente, EventTypeEnum.Like);
            return Ok();
        }
        
        /*
        EventSource Stream
        https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface
        
        data: – message body, a sequence of multiple data is interpreted as a single message, with \n between the parts.
        id: – renews lastEventId, sent in Last-Event-ID on reconnect.
        retry: – recommends a retry delay for reconnections in ms. There’s no way to set it from JavaScript.
        event: – event name, must precede data:.
        */
        private static async Task PushEvent(object dados, EventTypeEnum evento)
        {
            foreach (var client in _clients)
            {
                var eventTypeDescription =  Enum.GetName(typeof(EventTypeEnum), evento);
                var enventId = $"id: {Guid.NewGuid()}\n";
                var eventPayLoad = $"event: {eventTypeDescription}\n";
                var dataPayload = $"data: {JsonConvert.SerializeObject(dados)}\n";
                var endOfStreamChunk = "\n";
                
                var jsonObject = $"{enventId}{eventPayLoad}{dataPayload}{endOfStreamChunk}";
                
                string jsonEvento = jsonObject;
                await client.WriteAsync(jsonEvento);
                await client.FlushAsync();
            }
        }

        [HttpGet]
        [Route("Streaming")]
        public IActionResult Stream()
        {
            //'Content-Type': 'text/event-stream'
            Response.Headers.Add("Cache-Control", "no-cache");
            Response.Headers.Add("Connection", "keep-alive");
            Response.Headers.Add("Last-Event-ID", "");
            return new PushStreamResult(OnStreamAvailable, "text/event-stream", HttpContext.RequestAborted);
        }

        private void OnStreamAvailable(Stream stream, CancellationToken requestAborted)
        {
            var wait = requestAborted.WaitHandle;
            var client = new StreamWriter(stream);
            _clients.Add(client);

            wait.WaitOne();

            StreamWriter ignore;
            _clients.TryTake(out ignore);
        }
    }
}