# RabbitProxy - Refactored RabbitMQ Services for .NET Framework 4

A production-ready RabbitMQ consumer and supporting services for .NET Framework 4.

## Requirements

- .NET Framework 4.0 or later
- RabbitMQ.Client 5.2.0 (5.x is compatible with .NET Framework 4.0; 6.x requires .NET 4.6.1+)
- log4net 2.x

## Key Improvements Made

### RabbitMQ Connection & Channel Lifecycle

1. **Long-lived connection with automatic recovery**: Uses `AutomaticRecoveryEnabled` and `TopologyRecoveryEnabled` to let the RabbitMQ client handle reconnection, avoiding duplicate reconnection logic.

2. **Bounded retry logic**: `EnsureConnected` now has a configurable maximum retry count (`MaxConnectionRetries`) instead of an infinite loop that could hang indefinitely.

3. **Proper channel management**: `GetOrCreateChannel` is now thread-safe with double-check locking pattern, preventing race conditions when multiple threads request channels.

4. **QoS/Prefetch configuration**: Added `PrefetchCount` parameter and `BasicQos` call to limit how many unacknowledged messages a consumer holds, preventing memory issues under load.

### Error Handling & Robustness

5. **Bounded restart attempts**: Consumer restart logic now limits retry attempts (default 5) to prevent infinite restart loops on permanent failures.

6. **Background restart execution**: Restart logic runs on ThreadPool to avoid blocking RabbitMQ callbacks, preventing deadlocks.

7. **Proper acknowledgment pattern**: The message handler callback is responsible for calling `BasicAck` or `BasicNack`, giving full control over acknowledgment behavior.

8. **Automatic nack on handler exception**: If the user's handler throws, the message is nack'd with `requeue=true` to prevent message loss.

### Bug Fixes

9. **URL encoding fix**: `GetParameter` now URL-encodes both `product` and `key` parameters, fixing potential issues with special characters.

10. **Response stream null check**: Added null check for `response.GetResponseStream()` to handle edge cases.

11. **Fixed Utf8StringWriter**: The `Utf8StringWriter` class now properly inherits from `StringWriter` with correct constructor call.

12. **RabbitMQ client version compatibility**: Message body handling works with both old (byte[]) and new (ReadOnlyMemory<byte>) RabbitMQ client versions.

### API & Code Quality

13. **Parameter validation**: Added `Validate()` method to `RabbitConnectionParams` with clear error messages for required fields.

14. **IDisposable implementation**: Both `RabbitMQConnectionHolder` and `RabbitMessageReceiverService` properly implement `IDisposable` with disposal tracking.

15. **Shared connection support**: `RabbitMessageReceiverService` can accept an external `RabbitMQConnectionHolder` for scenarios with multiple consumers.

### Behavioral Changes to Note

- **MaxConnectionRetries**: Default is 5. Set to 0 for infinite retries (original behavior).
- **Message acknowledgment**: Caller must now explicitly call `BasicAck`/`BasicNack` in the handler.
- **Consumer restart limit**: Consumer stops after 5 failed restart attempts (configurable).

## Files

```
RabbitProxy/
├── Models/
│   └── RabbitConnectionParams.cs   - Connection configuration
├── Interfaces/
│   ├── IRabbitMessageReceiverService.cs
│   └── ILeadParameterService.cs
├── Services/
│   ├── RabbitMQConnectionHolder.cs   - Connection/channel management
│   ├── RabbitMessageReceiverService.cs - Message consumer
│   ├── XmlTradeParserService.cs      - XML trade parsing
│   └── LeadParameterService.cs       - HTTP service for LEAD data
└── Examples/
    └── UsageExample.cs               - Usage examples
```

## Quick Start

```csharp
var parameters = new RabbitConnectionParams
{
    ServerName = "localhost",
    Port = 5672,
    Username = "guest",
    Password = "guest",
    QueueName = "my.queue",
    PrefetchCount = 10
};

using (var receiver = new RabbitMessageReceiverService())
{
    receiver.StartConsuming(parameters, (message, channel, deliveryTag) =>
    {
        try
        {
            // Process message
            Console.WriteLine("Received: " + message);
            
            // Acknowledge success
            channel.BasicAck(deliveryTag, multiple: false);
        }
        catch (Exception ex)
        {
            // Reject and requeue
            channel.BasicNack(deliveryTag, multiple: false, requeue: true);
        }
    });

    Console.WriteLine("Press Enter to stop...");
    Console.ReadLine();
}
```

## License

Internal use only.
