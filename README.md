# Kafka Services

A streamlined Kafka service library for Node.js with TypeScript support. This library provides essential services for Kafka administration, producing, and consuming messages.

## Features

- 🚀 **Easy Setup** - Simple configuration and initialization
- 📊 **Admin Operations** - Topic management and metadata operations
- 📤 **Producer Service** - Send messages with batching support
- 📥 **Consumer Service** - Subscribe to topics with event-driven architecture
- 🔧 **TypeScript Support** - Full type safety and IntelliSense
- 🎯 **Event-Driven** - Built on EventEmitter for reactive programming

## Installation

```bash
npm install kafkaservices
```

## Quick Start

```typescript
import { KafkaService } from 'kafkaservices';

const kafka = new KafkaService();

// Send a message
await kafka.producer.sendMessage('my-topic', { hello: 'world' });

// Subscribe to topics
await kafka.consumer.subscribe(['my-topic']);

// Listen for messages
kafka.consumer.on('message', (messageData) => {
  console.log('Received:', messageData);
});

// Clean up
await kafka.disconnect();
```

## Configuration

```typescript
import { createKafkaConfig, KafkaService } from 'kafkaservices';

const config = createKafkaConfig(
  ['localhost:9092'], // brokers
  'my-client-id',     // clientId
  'my-group-id'       // groupId
);

const kafka = new KafkaService(config);
```

## Services

### Admin Service

```typescript
// Get all topics
const topics = await kafka.admin.getAllTopics();

// Get flow topics (ending with '-topic')
const flowTopics = await kafka.admin.getFlowTopics();

// Delete a topic
await kafka.admin.deleteTopic('old-topic');

// Get topic metadata
const metadata = await kafka.admin.getTopicMetadata(['topic1', 'topic2']);
```

### Producer Service

```typescript
// Send single message
await kafka.producer.sendMessage('topic', 'Hello World');

// Send JSON message
await kafka.producer.sendMessage('topic', { data: 'value' });

// Send to flow topic
await kafka.producer.sendToFlowTopic('org-user-node', { message: 'data' });

// Send batch
await kafka.producer.sendBatch('topic', [
  { value: 'message1' },
  { value: 'message2', key: 'key2' }
]);
```

### Consumer Service

```typescript
// Subscribe to topics
await kafka.consumer.subscribe(['topic1', 'topic2']);

// Subscribe from beginning
await kafka.consumer.subscribe(['topic1'], true);

// Subscribe to flow topics
await kafka.consumer.subscribeToFlowTopics('org-user-node');

// Listen for messages
kafka.consumer.on('message', (messageData) => {
  console.log('Message:', messageData);
});

// Listen for topic-specific messages
kafka.consumer.on('topic:my-topic', (messageData) => {
  console.log('Topic message:', messageData);
});
```

## Events

### Consumer Events
- `connected` - Consumer connected
- `disconnected` - Consumer disconnected
- `message` - New message received
- `topic:{topicName}` - Topic-specific message
- `error` - Error occurred

## Message Data Structure

```typescript
interface MessageData {
  topic: string;
  partition: number;
  offset: string;
  key?: string;
  value: string;
  timestamp: string;
  headers?: any;
}
```

## Error Handling

```typescript
try {
  await kafka.producer.sendMessage('topic', 'message');
} catch (error) {
  console.error('Failed to send message:', error);
}

// Event-based error handling
kafka.consumer.on('error', (error) => {
  console.error('Consumer error:', error);
});
```

## Complete Example

```typescript
import { KafkaService, createKafkaConfig } from 'kafkaservices';

async function main() {
  // Create custom configuration
  const config = createKafkaConfig(
    ['localhost:9092'],
    'my-app',
    'my-group'
  );

  const kafka = new KafkaService(config);

  try {
    // Check available topics
    const topics = await kafka.admin.getAllTopics();
    console.log('Available topics:', topics);

    // Send some messages
    await kafka.producer.sendMessage('test-topic', {
      timestamp: new Date().toISOString(),
      message: 'Hello from Kafka Services!'
    });

    // Subscribe to topics
    await kafka.consumer.subscribe(['test-topic']);

    // Handle messages
    kafka.consumer.on('message', (data) => {
      console.log(`Received from ${data.topic}:`, data.value);
    });

    kafka.consumer.on('connected', () => {
      console.log('Consumer connected successfully');
    });

    kafka.consumer.on('error', (error) => {
      console.error('Consumer error:', error);
    });

    // Keep running
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await kafka.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error:', error);
    await kafka.disconnect();
  }
}

main().catch(console.error);
```

## License

ISC