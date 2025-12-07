# RabbitMQ .NET Framework 4 - Common Problems and Solutions

## Table of Contents
1. [Connection Issues](#connection-issues)
2. [Authentication Problems](#authentication-problems)
3. [Channel Management](#channel-management)
4. [Connection Lifecycle](#connection-lifecycle)
5. [Message Serialization](#message-serialization)
6. [Threading and Concurrency](#threading-and-concurrency)
7. [Memory Leaks](#memory-leaks)
8. [Network and Timeout Issues](#network-and-timeout-issues)
9. [Error Handling Patterns](#error-handling-patterns)
10. [Configuration Issues](#configuration-issues)
11. [Queue and Exchange Management](#queue-and-exchange-management)
12. [Message Acknowledgment Issues](#message-acknowledgment-issues)
13. [Performance Problems](#performance-problems)
14. [SSL/TLS Configuration](#ssltls-configuration)
15. [Best Practices](#best-practices)

---

## Connection Issues

### Problem 1: Connection Timeout
**Symptom:** `TimeoutException` when trying to connect to RabbitMQ server.

**Causes:**
- Network connectivity issues
- Firewall blocking ports
- RabbitMQ server not running
- Incorrect host/port configuration

**Solution:**
```csharp
using RabbitMQ.Client;
using System;

public class RabbitMQConnectionManager
{
    private IConnection connection;
    private ConnectionFactory factory;

    public RabbitMQConnectionManager()
    {
        factory = new ConnectionFactory()
        {
            HostName = "localhost",
            Port = 5672,
            UserName = "guest",
            Password = "guest",
            RequestedConnectionTimeout = TimeSpan.FromSeconds(30), // Set explicit timeout
            SocketReadTimeout = TimeSpan.FromSeconds(30),
            SocketWriteTimeout = TimeSpan.FromSeconds(30)
        };
    }

    public IConnection GetConnection()
    {
        try
        {
            if (connection == null || !connection.IsOpen)
            {
                connection = factory.CreateConnection();
            }
            return connection;
        }
        catch (Exception ex)
        {
            // Log error
            Console.WriteLine($"Connection failed: {ex.Message}");
            throw;
        }
    }
}
```

### Problem 2: Connection Closed Unexpectedly
**Symptom:** `AlreadyClosedException` or connection drops without warning.

**Solution:**
```csharp
public class RobustConnectionManager
{
    private IConnection connection;
    private readonly object lockObject = new object();
    private ConnectionFactory factory;

    public RobustConnectionManager()
    {
        factory = new ConnectionFactory()
        {
            HostName = "localhost",
            AutomaticRecoveryEnabled = true, // Enable automatic recovery
            NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
            RequestedHeartbeat = TimeSpan.FromSeconds(60) // Heartbeat to detect dead connections
        };
    }

    public IConnection GetConnection()
    {
        lock (lockObject)
        {
            if (connection == null || !connection.IsOpen)
            {
                connection = factory.CreateConnection();
                
                // Subscribe to connection events
                connection.ConnectionShutdown += OnConnectionShutdown;
                connection.ConnectionBlocked += OnConnectionBlocked;
                connection.ConnectionUnblocked += OnConnectionUnblocked;
            }
            return connection;
        }
    }

    private void OnConnectionShutdown(object sender, ShutdownEventArgs reason)
    {
        Console.WriteLine($"Connection shutdown: {reason.ReplyText}");
        // Implement reconnection logic
    }

    private void OnConnectionBlocked(object sender, ConnectionBlockedEventArgs e)
    {
        Console.WriteLine($"Connection blocked: {e.Reason}");
    }

    private void OnConnectionUnblocked(object sender, EventArgs e)
    {
        Console.WriteLine("Connection unblocked");
    }
}
```

---

## Authentication Problems

### Problem 3: Authentication Failure
**Symptom:** `AuthenticationFailureException` or `BrokerUnreachableException`.

**Solution:**
```csharp
public class SecureConnectionManager
{
    public IConnection CreateSecureConnection()
    {
        var factory = new ConnectionFactory()
        {
            HostName = "localhost",
            Port = 5672,
            UserName = "your_username", // Ensure correct username
            Password = "your_password", // Ensure correct password
            VirtualHost = "/", // Default virtual host, change if needed
            AuthMechanisms = new IAuthMechanismFactory[]
            {
                new PlainMechanismFactory() // Explicitly set auth mechanism
            }
        };

        try
        {
            return factory.CreateConnection();
        }
        catch (BrokerUnreachableException ex)
        {
            // Check credentials and server accessibility
            throw new Exception("Failed to connect. Check credentials and server status.", ex);
        }
    }
}
```

---

## Channel Management

### Problem 4: Channel Closed Exception
**Symptom:** `AlreadyClosedException` when using a channel.

**Solution:**
```csharp
public class ChannelManager
{
    private IConnection connection;
    private IModel channel;
    private readonly object channelLock = new object();

    public IModel GetChannel()
    {
        lock (channelLock)
        {
            if (connection == null || !connection.IsOpen)
            {
                var factory = new ConnectionFactory() { HostName = "localhost" };
                connection = factory.CreateConnection();
            }

            if (channel == null || channel.IsClosed)
            {
                channel = connection.CreateModel();
                
                // Subscribe to channel events
                channel.ModelShutdown += OnChannelShutdown;
                channel.CallbackException += OnCallbackException;
            }

            return channel;
        }
    }

    private void OnChannelShutdown(object sender, ShutdownEventArgs reason)
    {
        Console.WriteLine($"Channel shutdown: {reason.ReplyText}");
        channel = null; // Mark for recreation
    }

    private void OnCallbackException(object sender, CallbackExceptionEventArgs e)
    {
        Console.WriteLine($"Channel callback exception: {e.Exception.Message}");
        channel = null; // Mark for recreation
    }

    public void Dispose()
    {
        channel?.Close();
        channel?.Dispose();
        connection?.Close();
        connection?.Dispose();
    }
}
```

### Problem 5: Channel Limit Exceeded
**Symptom:** Cannot create more channels (server limit reached).

**Solution:**
```csharp
public class ChannelPool
{
    private readonly ConcurrentQueue<IModel> channelPool = new ConcurrentQueue<IModel>();
    private readonly IConnection connection;
    private readonly int maxChannels;
    private int currentChannelCount = 0;
    private readonly object lockObject = new object();

    public ChannelPool(IConnection connection, int maxChannels = 100)
    {
        this.connection = connection;
        this.maxChannels = maxChannels;
    }

    public IModel GetChannel()
    {
        if (channelPool.TryDequeue(out IModel channel) && channel.IsOpen)
        {
            return channel;
        }

        lock (lockObject)
        {
            if (currentChannelCount >= maxChannels)
            {
                throw new InvalidOperationException("Maximum channel limit reached");
            }

            channel = connection.CreateModel();
            currentChannelCount++;
            return channel;
        }
    }

    public void ReturnChannel(IModel channel)
    {
        if (channel != null && channel.IsOpen)
        {
            channelPool.Enqueue(channel);
        }
        else
        {
            lock (lockObject)
            {
                currentChannelCount--;
            }
        }
    }
}
```

---

## Connection Lifecycle

### Problem 6: Not Properly Disposing Resources
**Symptom:** Memory leaks, connection exhaustion, resource not released.

**Solution:**
```csharp
public class RabbitMQService : IDisposable
{
    private IConnection connection;
    private IModel channel;
    private bool disposed = false;

    public RabbitMQService()
    {
        var factory = new ConnectionFactory() { HostName = "localhost" };
        connection = factory.CreateConnection();
        channel = connection.CreateModel();
    }

    public void Publish(string queueName, string message)
    {
        if (disposed) throw new ObjectDisposedException(nameof(RabbitMQService));

        channel.QueueDeclare(queue: queueName, durable: true, exclusive: false, autoDelete: false, arguments: null);
        
        var body = Encoding.UTF8.GetBytes(message);
        channel.BasicPublish(exchange: "", routingKey: queueName, basicProperties: null, body: body);
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!disposed)
        {
            if (disposing)
            {
                try
                {
                    channel?.Close();
                    channel?.Dispose();
                }
                catch { }

                try
                {
                    connection?.Close();
                    connection?.Dispose();
                }
                catch { }
            }
            disposed = true;
        }
    }
}
```

---

## Message Serialization

### Problem 7: Serialization Errors
**Symptom:** Messages cannot be deserialized, `InvalidCastException`.

**Solution:**
```csharp
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;

public class MessageSerializer
{
    public byte[] Serialize<T>(T obj)
    {
        if (obj == null) return null;

        try
        {
            using (var stream = new MemoryStream())
            {
                var serializer = new DataContractJsonSerializer(typeof(T));
                serializer.WriteObject(stream, obj);
                return stream.ToArray();
            }
        }
        catch (Exception ex)
        {
            throw new SerializationException($"Failed to serialize {typeof(T).Name}", ex);
        }
    }

    public T Deserialize<T>(byte[] data)
    {
        if (data == null || data.Length == 0) return default(T);

        try
        {
            using (var stream = new MemoryStream(data))
            {
                var serializer = new DataContractJsonSerializer(typeof(T));
                return (T)serializer.ReadObject(stream);
            }
        }
        catch (Exception ex)
        {
            throw new SerializationException($"Failed to deserialize to {typeof(T).Name}", ex);
        }
    }
}

// Usage
public class MessagePublisher
{
    private IModel channel;
    private MessageSerializer serializer = new MessageSerializer();

    public void Publish<T>(string queueName, T message)
    {
        var body = serializer.Serialize(message);
        var properties = channel.CreateBasicProperties();
        properties.Persistent = true;
        properties.ContentType = "application/json";
        properties.Type = typeof(T).Name;

        channel.BasicPublish(exchange: "", routingKey: queueName, basicProperties: properties, body: body);
    }
}
```

---

## Threading and Concurrency

### Problem 8: Thread Safety Issues
**Symptom:** Race conditions, `InvalidOperationException`, corrupted messages.

**Solution:**
```csharp
public class ThreadSafeRabbitMQClient
{
    private readonly IConnection connection;
    private readonly ThreadLocal<IModel> channelLocal = new ThreadLocal<IModel>(() => null);
    private readonly object connectionLock = new object();

    public ThreadSafeRabbitMQClient()
    {
        var factory = new ConnectionFactory() { HostName = "localhost" };
        connection = factory.CreateConnection();
    }

    public IModel GetChannel()
    {
        if (channelLocal.Value == null || channelLocal.Value.IsClosed)
        {
            lock (connectionLock)
            {
                if (channelLocal.Value == null || channelLocal.Value.IsClosed)
                {
                    channelLocal.Value = connection.CreateModel();
                }
            }
        }
        return channelLocal.Value;
    }

    public void Publish(string queueName, string message)
    {
        var channel = GetChannel();
        lock (channel) // Additional synchronization if needed
        {
            var body = Encoding.UTF8.GetBytes(message);
            channel.BasicPublish(exchange: "", routingKey: queueName, basicProperties: null, body: body);
        }
    }
}
```

### Problem 9: Blocking Operations on UI Thread
**Symptom:** Application freezes when publishing/consuming messages.

**Solution:**
```csharp
using System.Threading.Tasks;

public class AsyncRabbitMQClient
{
    private IConnection connection;
    private IModel channel;

    public async Task PublishAsync(string queueName, string message)
    {
        await Task.Run(() =>
        {
            if (channel == null || channel.IsClosed)
            {
                var factory = new ConnectionFactory() { HostName = "localhost" };
                connection = factory.CreateConnection();
                channel = connection.CreateModel();
            }

            var body = Encoding.UTF8.GetBytes(message);
            channel.BasicPublish(exchange: "", routingKey: queueName, basicProperties: null, body: body);
        });
    }

    public async Task<string> ConsumeAsync(string queueName, CancellationToken cancellationToken)
    {
        return await Task.Run(() =>
        {
            if (channel == null || channel.IsClosed)
            {
                var factory = new ConnectionFactory() { HostName = "localhost" };
                connection = factory.CreateConnection();
                channel = connection.CreateModel();
            }

            channel.QueueDeclare(queue: queueName, durable: true, exclusive: false, autoDelete: false, arguments: null);

            var result = channel.BasicGet(queueName, autoAck: false);
            if (result != null)
            {
                channel.BasicAck(result.DeliveryTag, false);
                return Encoding.UTF8.GetString(result.Body);
            }
            return null;
        }, cancellationToken);
    }
}
```

---

## Memory Leaks

### Problem 10: Memory Leak from Event Handlers
**Symptom:** Memory usage continuously increases, application becomes slow.

**Solution:**
```csharp
public class MemorySafeConnectionManager : IDisposable
{
    private IConnection connection;
    private IModel channel;
    private bool disposed = false;

    public void Initialize()
    {
        var factory = new ConnectionFactory() { HostName = "localhost" };
        connection = factory.CreateConnection();
        channel = connection.CreateModel();

        // Subscribe to events
        connection.ConnectionShutdown += OnConnectionShutdown;
        channel.ModelShutdown += OnChannelShutdown;
    }

    private void OnConnectionShutdown(object sender, ShutdownEventArgs e)
    {
        // Handle shutdown
    }

    private void OnChannelShutdown(object sender, ShutdownEventArgs e)
    {
        // Handle shutdown
    }

    public void Dispose()
    {
        if (!disposed)
        {
            // Unsubscribe from events to prevent memory leaks
            if (connection != null)
            {
                connection.ConnectionShutdown -= OnConnectionShutdown;
                connection.Close();
                connection.Dispose();
            }

            if (channel != null)
            {
                channel.ModelShutdown -= OnChannelShutdown;
                channel.Close();
                channel.Dispose();
            }

            disposed = true;
        }
    }
}
```

### Problem 11: Accumulating Unacknowledged Messages
**Symptom:** Memory usage grows, messages not processed.

**Solution:**
```csharp
public class MessageConsumer
{
    private IModel channel;
    private readonly int prefetchCount;

    public MessageConsumer(IModel channel, int prefetchCount = 10)
    {
        this.channel = channel;
        this.prefetchCount = prefetchCount;
        
        // Limit unacknowledged messages
        channel.BasicQos(prefetchSize: 0, prefetchCount: (ushort)prefetchCount, global: false);
    }

    public void Consume(string queueName)
    {
        var consumer = new EventingBasicConsumer(channel);
        
        consumer.Received += (model, ea) =>
        {
            try
            {
                var body = ea.Body;
                var message = Encoding.UTF8.GetString(body);
                
                // Process message
                ProcessMessage(message);
                
                // Always acknowledge, even on error (or use dead letter queue)
                channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing message: {ex.Message}");
                
                // Reject and requeue, or send to dead letter queue
                channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: true);
            }
        };

        channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
    }

    private void ProcessMessage(string message)
    {
        // Your processing logic
    }
}
```

---

## Network and Timeout Issues

### Problem 12: Network Timeouts
**Symptom:** Operations timeout, connections drop.

**Solution:**
```csharp
public class TimeoutConfiguredConnection
{
    public IConnection CreateConnection()
    {
        var factory = new ConnectionFactory()
        {
            HostName = "localhost",
            Port = 5672,
            RequestedConnectionTimeout = TimeSpan.FromSeconds(30),
            SocketReadTimeout = TimeSpan.FromSeconds(30),
            SocketWriteTimeout = TimeSpan.FromSeconds(30),
            RequestedHeartbeat = TimeSpan.FromSeconds(60), // Detect dead connections
            ContinuationTimeout = TimeSpan.FromSeconds(10)
        };

        return factory.CreateConnection();
    }
}
```

### Problem 13: Network Partition Handling
**Symptom:** Application loses connection during network issues.

**Solution:**
```csharp
public class ResilientConnectionManager
{
    private IConnection connection;
    private readonly ConnectionFactory factory;
    private readonly int maxRetries = 5;
    private readonly TimeSpan retryDelay = TimeSpan.FromSeconds(5);

    public ResilientConnectionManager()
    {
        factory = new ConnectionFactory()
        {
            HostName = "localhost",
            AutomaticRecoveryEnabled = true,
            NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
            TopologyRecoveryEnabled = true // Recover exchanges, queues, bindings
        };
    }

    public IConnection GetConnection()
    {
        int retries = 0;
        while (retries < maxRetries)
        {
            try
            {
                if (connection == null || !connection.IsOpen)
                {
                    connection = factory.CreateConnection();
                    connection.ConnectionShutdown += (sender, args) =>
                    {
                        Console.WriteLine($"Connection lost: {args.ReplyText}");
                        // Automatic recovery will handle reconnection
                    };
                }
                return connection;
            }
            catch (Exception ex)
            {
                retries++;
                Console.WriteLine($"Connection attempt {retries} failed: {ex.Message}");
                if (retries < maxRetries)
                {
                    Thread.Sleep(retryDelay);
                }
                else
                {
                    throw;
                }
            }
        }
        throw new Exception("Failed to establish connection after maximum retries");
    }
}
```

---

## Error Handling Patterns

### Problem 14: Unhandled Exceptions in Consumers
**Symptom:** Consumer stops processing, exceptions not caught.

**Solution:**
```csharp
public class RobustConsumer
{
    private IModel channel;

    public void StartConsuming(string queueName)
    {
        var consumer = new EventingBasicConsumer(channel);
        
        consumer.Received += (model, ea) =>
        {
            try
            {
                ProcessMessage(ea);
            }
            catch (Exception ex)
            {
                HandleConsumerError(ex, ea);
            }
        };

        consumer.Shutdown += (model, args) =>
        {
            Console.WriteLine($"Consumer shutdown: {args.ReplyText}");
        };

        consumer.Registered += (model, args) =>
        {
            Console.WriteLine("Consumer registered");
        };

        consumer.Unregistered += (model, args) =>
        {
            Console.WriteLine("Consumer unregistered");
        };

        channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
    }

    private void ProcessMessage(BasicDeliverEventArgs ea)
    {
        var body = ea.Body;
        var message = Encoding.UTF8.GetString(body);
        
        // Your processing logic
        Console.WriteLine($"Received: {message}");
        
        channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
    }

    private void HandleConsumerError(Exception ex, BasicDeliverEventArgs ea)
    {
        Console.WriteLine($"Error processing message: {ex.Message}");
        
        // Option 1: Reject and requeue
        channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: true);
        
        // Option 2: Send to dead letter queue
        // channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: false);
        
        // Option 3: Log and acknowledge (lose message)
        // channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
    }
}
```

### Problem 15: Publisher Confirms Not Handled
**Symptom:** Messages may be lost without confirmation.

**Solution:**
```csharp
public class ConfirmedPublisher
{
    private IModel channel;
    private readonly Dictionary<ulong, string> outstandingConfirms = new Dictionary<ulong, string>();

    public ConfirmedPublisher(IModel channel)
    {
        this.channel = channel;
        channel.ConfirmSelect(); // Enable publisher confirms
        
        channel.BasicAcks += OnBasicAcks;
        channel.BasicNacks += OnBasicNacks;
    }

    public void PublishWithConfirmation(string queueName, string message)
    {
        channel.QueueDeclare(queue: queueName, durable: true, exclusive: false, autoDelete: false, arguments: null);
        
        var body = Encoding.UTF8.GetBytes(message);
        var properties = channel.CreateBasicProperties();
        properties.Persistent = true;
        
        lock (outstandingConfirms)
        {
            var seqNo = channel.NextPublishSeqNo;
            outstandingConfirms.Add(seqNo, message);
        }
        
        channel.BasicPublish(exchange: "", routingKey: queueName, basicProperties: properties, body: body);
    }

    private void OnBasicAcks(object sender, BasicAckEventArgs e)
    {
        lock (outstandingConfirms)
        {
            if (e.Multiple)
            {
                var confirmed = outstandingConfirms.Where(k => k.Key <= e.DeliveryTag).ToList();
                foreach (var entry in confirmed)
                {
                    outstandingConfirms.Remove(entry.Key);
                    Console.WriteLine($"Message confirmed: {entry.Value}");
                }
            }
            else
            {
                if (outstandingConfirms.TryGetValue(e.DeliveryTag, out string message))
                {
                    outstandingConfirms.Remove(e.DeliveryTag);
                    Console.WriteLine($"Message confirmed: {message}");
                }
            }
        }
    }

    private void OnBasicNacks(object sender, BasicNackEventArgs e)
    {
        lock (outstandingConfirms)
        {
            if (outstandingConfirms.TryGetValue(e.DeliveryTag, out string message))
            {
                outstandingConfirms.Remove(e.DeliveryTag);
                Console.WriteLine($"Message NOT confirmed (nacked): {message}");
                // Handle failed publish - retry or log
            }
        }
    }
}
```

---

## Configuration Issues

### Problem 16: App.config Configuration Errors
**Symptom:** Connection fails, configuration not read properly.

**Solution:**
```xml
<!-- App.config -->
<configuration>
  <configSections>
    <section name="rabbitMQ" type="System.Configuration.NameValueSectionHandler"/>
  </configSections>
  
  <rabbitMQ>
    <add key="HostName" value="localhost"/>
    <add key="Port" value="5672"/>
    <add key="UserName" value="guest"/>
    <add key="Password" value="guest"/>
    <add key="VirtualHost" value="/"/>
  </rabbitMQ>
</configuration>
```

```csharp
using System.Configuration;

public class ConfigurableConnectionFactory
{
    public ConnectionFactory CreateFromConfig()
    {
        var config = ConfigurationManager.GetSection("rabbitMQ") as System.Collections.Specialized.NameValueCollection;
        
        if (config == null)
        {
            throw new ConfigurationErrorsException("RabbitMQ configuration section not found");
        }

        return new ConnectionFactory()
        {
            HostName = config["HostName"] ?? "localhost",
            Port = int.Parse(config["Port"] ?? "5672"),
            UserName = config["UserName"] ?? "guest",
            Password = config["Password"] ?? "guest",
            VirtualHost = config["VirtualHost"] ?? "/"
        };
    }
}
```

---

## Queue and Exchange Management

### Problem 17: Queue Already Exists with Different Properties
**Symptom:** `OperationInterruptedException` when declaring queue.

**Solution:**
```csharp
public class SafeQueueManager
{
    private IModel channel;

    public void DeclareQueue(string queueName, bool durable = true, bool exclusive = false, bool autoDelete = false)
    {
        try
        {
            channel.QueueDeclare(
                queue: queueName,
                durable: durable,
                exclusive: exclusive,
                autoDelete: autoDelete,
                arguments: null);
        }
        catch (OperationInterruptedException ex)
        {
            // Queue exists with different properties
            Console.WriteLine($"Queue {queueName} exists with different properties: {ex.Message}");
            
            // Option 1: Delete and recreate (use with caution)
            // channel.QueueDelete(queueName);
            // channel.QueueDeclare(queue: queueName, durable: durable, exclusive: exclusive, autoDelete: autoDelete, arguments: null);
            
            // Option 2: Use existing queue (recommended)
            // Just continue - queue exists
        }
    }

    public void DeclareQueueIfNotExists(string queueName, bool durable = true)
    {
        try
        {
            channel.QueueDeclarePassive(queueName); // Check if exists
        }
        catch
        {
            // Queue doesn't exist, create it
            channel.QueueDeclare(queue: queueName, durable: durable, exclusive: false, autoDelete: false, arguments: null);
        }
    }
}
```

### Problem 18: Exchange Not Found
**Symptom:** `OperationInterruptedException` when publishing to exchange.

**Solution:**
```csharp
public class ExchangeManager
{
    private IModel channel;

    public void DeclareExchange(string exchangeName, string exchangeType = ExchangeType.Topic)
    {
        try
        {
            channel.ExchangeDeclare(
                exchange: exchangeName,
                type: exchangeType,
                durable: true,
                autoDelete: false,
                arguments: null);
        }
        catch (OperationInterruptedException ex)
        {
            Console.WriteLine($"Exchange {exchangeName} already exists or error: {ex.Message}");
        }
    }

    public void BindQueue(string queueName, string exchangeName, string routingKey)
    {
        try
        {
            channel.QueueBind(
                queue: queueName,
                exchange: exchangeName,
                routingKey: routingKey);
        }
        catch (OperationInterruptedException ex)
        {
            Console.WriteLine($"Binding failed: {ex.Message}");
            throw;
        }
    }
}
```

---

## Message Acknowledgment Issues

### Problem 19: Messages Not Acknowledged
**Symptom:** Messages redelivered repeatedly, consumer stops.

**Solution:**
```csharp
public class AcknowledgmentHandler
{
    private IModel channel;

    public void ConsumeWithProperAck(string queueName)
    {
        channel.BasicQos(prefetchSize: 0, prefetchCount: 10, global: false);
        
        var consumer = new EventingBasicConsumer(channel);
        
        consumer.Received += (model, ea) =>
        {
            try
            {
                var message = Encoding.UTF8.GetString(ea.Body);
                
                // Process message
                if (ProcessMessage(message))
                {
                    // Acknowledge on success
                    channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                }
                else
                {
                    // Reject and don't requeue (send to DLQ if configured)
                    channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: false);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                
                // Reject and requeue for retry
                channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: true);
            }
        };

        channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
    }

    private bool ProcessMessage(string message)
    {
        // Your processing logic
        return true; // Return false to reject message
    }
}
```

### Problem 20: Duplicate Acknowledgments
**Symptom:** `AlreadyClosedException` or `InvalidOperationException`.

**Solution:**
```csharp
public class SafeAcknowledgmentHandler
{
    private IModel channel;
    private readonly HashSet<ulong> acknowledgedTags = new HashSet<ulong>();
    private readonly object ackLock = new object();

    public void SafeAck(ulong deliveryTag, bool multiple = false)
    {
        lock (ackLock)
        {
            if (channel.IsClosed)
            {
                Console.WriteLine("Channel is closed, cannot acknowledge");
                return;
            }

            if (multiple)
            {
                // For multiple, check if any tag in range is already acknowledged
                var toAck = acknowledgedTags.Where(t => t <= deliveryTag).ToList();
                if (toAck.Count > 0)
                {
                    Console.WriteLine("Some tags already acknowledged");
                    return;
                }
            }
            else
            {
                if (acknowledgedTags.Contains(deliveryTag))
                {
                    Console.WriteLine($"Tag {deliveryTag} already acknowledged");
                    return;
                }
            }

            try
            {
                channel.BasicAck(deliveryTag: deliveryTag, multiple: multiple);
                
                if (multiple)
                {
                    // Mark all tags up to deliveryTag as acknowledged
                    for (ulong tag = 1; tag <= deliveryTag; tag++)
                    {
                        acknowledgedTags.Add(tag);
                    }
                }
                else
                {
                    acknowledgedTags.Add(deliveryTag);
                }
            }
            catch (AlreadyClosedException ex)
            {
                Console.WriteLine($"Channel closed during ack: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ack error: {ex.Message}");
            }
        }
    }
}
```

---

## Performance Problems

### Problem 21: Slow Message Publishing
**Symptom:** Publishing takes too long, throughput is low.

**Solution:**
```csharp
public class HighPerformancePublisher
{
    private IModel channel;
    private readonly object publishLock = new object();

    public HighPerformancePublisher(IModel channel)
    {
        this.channel = channel;
        
        // Disable publisher confirms for better performance (if message loss is acceptable)
        // channel.ConfirmSelect(); // Comment out if not needed
        
        // Use transaction batching (if confirms not used)
        // channel.TxSelect();
    }

    public void PublishBatch(string queueName, List<string> messages)
    {
        lock (publishLock)
        {
            channel.QueueDeclare(queue: queueName, durable: true, exclusive: false, autoDelete: false, arguments: null);

            var properties = channel.CreateBasicProperties();
            properties.Persistent = true;

            foreach (var message in messages)
            {
                var body = Encoding.UTF8.GetBytes(message);
                channel.BasicPublish(exchange: "", routingKey: queueName, basicProperties: properties, body: body);
            }

            // Commit transaction (if using transactions)
            // channel.TxCommit();
        }
    }

    // Alternative: Use multiple channels for parallel publishing
    public void PublishParallel(string queueName, List<string> messages)
    {
        var tasks = messages.Select(message => Task.Run(() =>
        {
            using (var channel = connection.CreateModel())
            {
                var body = Encoding.UTF8.GetBytes(message);
                channel.BasicPublish(exchange: "", routingKey: queueName, basicProperties: null, body: body);
            }
        }));

        Task.WaitAll(tasks.ToArray());
    }
}
```

### Problem 22: Consumer Bottleneck
**Symptom:** Messages queue up, consumer can't keep up.

**Solution:**
```csharp
public class ParallelConsumer
{
    private IConnection connection;
    private readonly int consumerCount;

    public ParallelConsumer(IConnection connection, int consumerCount = 5)
    {
        this.connection = connection;
        this.consumerCount = consumerCount;
    }

    public void StartConsuming(string queueName)
    {
        for (int i = 0; i < consumerCount; i++)
        {
            var channel = connection.CreateModel();
            channel.BasicQos(prefetchSize: 0, prefetchCount: 10, global: false);

            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += (model, ea) =>
            {
                Task.Run(() => // Process in background thread
                {
                    try
                    {
                        var message = Encoding.UTF8.GetString(ea.Body);
                        ProcessMessage(message);
                        channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error: {ex.Message}");
                        channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: true);
                    }
                });
            };

            channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
        }
    }

    private void ProcessMessage(string message)
    {
        // Your processing logic
    }
}
```

---

## SSL/TLS Configuration

### Problem 23: SSL Connection Failures
**Symptom:** Cannot connect with SSL, certificate errors.

**Solution:**
```csharp
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;

public class SSLConnectionManager
{
    public IConnection CreateSSLConnection()
    {
        var factory = new ConnectionFactory()
        {
            HostName = "your-rabbitmq-server",
            Port = 5671, // SSL port
            UserName = "your_username",
            Password = "your_password",
            Ssl = new SslOption()
            {
                Enabled = true,
                ServerName = "your-rabbitmq-server",
                CertPath = @"path\to\client\certificate.p12",
                CertPassphrase = "certificate_password",
                AcceptablePolicyErrors = SslPolicyErrors.RemoteCertificateChainErrors | 
                                        SslPolicyErrors.RemoteCertificateNameMismatch
            }
        };

        // For development/testing - accept all certificates (NOT for production)
        factory.Ssl.AcceptablePolicyErrors = SslPolicyErrors.RemoteCertificateChainErrors |
                                            SslPolicyErrors.RemoteCertificateNameMismatch |
                                            SslPolicyErrors.RemoteCertificateNotAvailable;

        return factory.CreateConnection();
    }

    // Custom certificate validation
    public IConnection CreateSSLConnectionWithValidation()
    {
        var factory = new ConnectionFactory()
        {
            HostName = "your-rabbitmq-server",
            Port = 5671,
            UserName = "your_username",
            Password = "your_password",
            Ssl = new SslOption()
            {
                Enabled = true,
                ServerName = "your-rabbitmq-server",
                CertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) =>
                {
                    // Custom validation logic
                    if (sslPolicyErrors == SslPolicyErrors.None)
                        return true;

                    // Log the certificate errors
                    Console.WriteLine($"SSL Policy Errors: {sslPolicyErrors}");

                    // For production, implement proper certificate validation
                    return false; // Reject if errors
                }
            }
        };

        return factory.CreateConnection();
    }
}
```

---

## Best Practices

### Problem 24: General Best Practices Implementation
**Solution:**
```csharp
public class BestPracticesRabbitMQClient : IDisposable
{
    private IConnection connection;
    private readonly ConnectionFactory factory;
    private readonly object connectionLock = new object();
    private bool disposed = false;

    public BestPracticesRabbitMQClient()
    {
        factory = new ConnectionFactory()
        {
            HostName = "localhost",
            Port = 5672,
            UserName = "guest",
            Password = "guest",
            
            // Connection settings
            RequestedConnectionTimeout = TimeSpan.FromSeconds(30),
            SocketReadTimeout = TimeSpan.FromSeconds(30),
            SocketWriteTimeout = TimeSpan.FromSeconds(30),
            RequestedHeartbeat = TimeSpan.FromSeconds(60),
            
            // Recovery settings
            AutomaticRecoveryEnabled = true,
            NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
            TopologyRecoveryEnabled = true,
            
            // Continuation timeout
            ContinuationTimeout = TimeSpan.FromSeconds(10)
        };
    }

    public IConnection GetConnection()
    {
        if (disposed) throw new ObjectDisposedException(nameof(BestPracticesRabbitMQClient));

        lock (connectionLock)
        {
            if (connection == null || !connection.IsOpen)
            {
                connection = factory.CreateConnection();
                
                // Subscribe to connection events
                connection.ConnectionShutdown += OnConnectionShutdown;
                connection.ConnectionBlocked += OnConnectionBlocked;
                connection.ConnectionUnblocked += OnConnectionUnblocked;
            }
            return connection;
        }
    }

    public IModel CreateChannel()
    {
        var conn = GetConnection();
        var channel = conn.CreateModel();
        
        // Set QoS to prevent overwhelming consumer
        channel.BasicQos(prefetchSize: 0, prefetchCount: 10, global: false);
        
        // Subscribe to channel events
        channel.ModelShutdown += OnChannelShutdown;
        channel.CallbackException += OnCallbackException;
        
        return channel;
    }

    public void Publish(string exchange, string routingKey, string message, bool persistent = true)
    {
        using (var channel = CreateChannel())
        {
            var properties = channel.CreateBasicProperties();
            properties.Persistent = persistent;
            properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());
            properties.MessageId = Guid.NewGuid().ToString();

            var body = Encoding.UTF8.GetBytes(message);
            
            try
            {
                channel.BasicPublish(
                    exchange: exchange,
                    routingKey: routingKey,
                    mandatory: false,
                    basicProperties: properties,
                    body: body);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Publish failed: {ex.Message}");
                throw;
            }
        }
    }

    public void Consume(string queueName, Action<string> messageHandler)
    {
        using (var channel = CreateChannel())
        {
            var consumer = new EventingBasicConsumer(channel);
            
            consumer.Received += (model, ea) =>
            {
                try
                {
                    var message = Encoding.UTF8.GetString(ea.Body);
                    messageHandler(message);
                    channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error processing message: {ex.Message}");
                    channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: true);
                }
            };

            channel.BasicConsume(queue: queueName, autoAck: false, consumer: consumer);
            
            // Keep consumer alive
            Console.WriteLine("Press [enter] to exit.");
            Console.ReadLine();
        }
    }

    private void OnConnectionShutdown(object sender, ShutdownEventArgs reason)
    {
        Console.WriteLine($"Connection shutdown: {reason.ReplyText}");
    }

    private void OnConnectionBlocked(object sender, ConnectionBlockedEventArgs e)
    {
        Console.WriteLine($"Connection blocked: {e.Reason}");
    }

    private void OnConnectionUnblocked(object sender, EventArgs e)
    {
        Console.WriteLine("Connection unblocked");
    }

    private void OnChannelShutdown(object sender, ShutdownEventArgs reason)
    {
        Console.WriteLine($"Channel shutdown: {reason.ReplyText}");
    }

    private void OnCallbackException(object sender, CallbackExceptionEventArgs e)
    {
        Console.WriteLine($"Callback exception: {e.Exception.Message}");
    }

    public void Dispose()
    {
        if (!disposed)
        {
            if (connection != null)
            {
                connection.ConnectionShutdown -= OnConnectionShutdown;
                connection.ConnectionBlocked -= OnConnectionBlocked;
                connection.ConnectionUnblocked -= OnConnectionUnblocked;
                
                try
                {
                    connection.Close();
                }
                catch { }
                
                connection.Dispose();
            }
            
            disposed = true;
        }
    }
}
```

---

## Summary Checklist

When implementing RabbitMQ in .NET Framework 4, ensure:

- ✅ Enable automatic recovery (`AutomaticRecoveryEnabled = true`)
- ✅ Set appropriate timeouts (connection, socket, heartbeat)
- ✅ Implement proper error handling in consumers
- ✅ Always acknowledge or reject messages
- ✅ Use QoS to limit unacknowledged messages
- ✅ Dispose connections and channels properly
- ✅ Unsubscribe from events to prevent memory leaks
- ✅ Use thread-safe patterns for concurrent access
- ✅ Implement retry logic for transient failures
- ✅ Use publisher confirms for critical messages
- ✅ Configure dead letter queues for failed messages
- ✅ Monitor connection and channel health
- ✅ Use connection pooling for high-throughput scenarios
- ✅ Implement proper logging and monitoring
- ✅ Test network partition scenarios
- ✅ Use SSL/TLS in production environments
- ✅ Set appropriate prefetch counts
- ✅ Handle serialization errors gracefully
- ✅ Use transactions or confirms for message guarantees
- ✅ Implement circuit breaker pattern for resilience

---

## Additional Resources

- [RabbitMQ .NET Client Documentation](https://www.rabbitmq.com/dotnet.html)
- [RabbitMQ Best Practices](https://www.rabbitmq.com/best-practices.html)
- [Connection Recovery](https://www.rabbitmq.com/api-guide.html#recovery)
- [Publisher Confirms](https://www.rabbitmq.com/confirms.html)
