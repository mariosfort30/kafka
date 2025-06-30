import { defaultKafkaConfig } from "./config/kafkaConfig.js";
import { KafkaAdminService } from "./services/KafkaAdminService.js";
import { KafkaProducerService } from "./services/KafkaProducerService.js";
import { KafkaConsumerService } from "./services/KafkaConsumerService.js";

export {
  // Configuration
  defaultKafkaConfig,
  createKafkaConfig,
  type KafkaConnectionConfig,
} from "./config/kafkaConfig.js";

export {
  // Services
  KafkaAdminService,
  KafkaProducerService,
  KafkaConsumerService,
} from "./services/index.js";

// Main class that combines all services
export class KafkaService {
  public admin: KafkaAdminService;
  public producer: KafkaProducerService;
  public consumer: KafkaConsumerService;

  constructor(config = defaultKafkaConfig) {
    this.admin = new KafkaAdminService(config);
    this.producer = new KafkaProducerService(config);
    this.consumer = new KafkaConsumerService(config);
  }

  /**
   * Disconnect all services
   */
  async disconnect(): Promise<void> {
    await Promise.all([
      this.admin.disconnect(),
      this.producer.disconnect(),
      this.consumer.disconnect(),
    ]);
    console.log("🔌 All Kafka services disconnected");
  }
}

// Example usage
async function example() {
  console.log("🚀 Starting Kafka Services...");
  const kafka = new KafkaService();

  try {
    console.log("📋 Fetching available topics...");
    // Get all topics
    const topics = await kafka.admin.getAllTopics();
    console.log("✅ Available topics:", topics);

    console.log("📤 Sending test message...");
    // Send a message
    await kafka.producer.sendMessage("test-topic", { 
      message: "Hello Kafka!", 
      timestamp: new Date().toISOString() 
    });
    console.log("✅ Message sent successfully");

    console.log("📥 Setting up consumer...");
    // Subscribe to topics
    await kafka.consumer.subscribe(["test-topic"]);

    // Listen for messages
    kafka.consumer.on("message", (messageData) => {
      console.log("📨 Received message:", {
        topic: messageData.topic,
        value: messageData.value,
        timestamp: messageData.timestamp
      });
    });

    kafka.consumer.on("connected", () => {
      console.log("✅ Consumer connected and listening...");
    });

    kafka.consumer.on("error", (error) => {
      console.error("❌ Consumer error:", error);
    });

    console.log("⏳ Running for 10 seconds to demonstrate...");
    // Keep running for a bit to receive messages
    setTimeout(async () => {
      console.log("🛑 Shutting down services...");
      await kafka.disconnect();
      console.log("✅ Example completed successfully");
      process.exit(0);
    }, 10000);

  } catch (error) {
    console.error("❌ Error:", error);
    await kafka.disconnect();
    process.exit(1);
  }
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🎯 Running Kafka Services Example");
  example().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}