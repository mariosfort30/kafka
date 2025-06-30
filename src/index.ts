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
  const kafka = new KafkaService();

  try {
    // Get all topics
    const topics = await kafka.admin.getAllTopics();
    console.log("Available topics:", topics);

    // Send a message
    await kafka.producer.sendMessage("test-topic", { message: "Hello Kafka!" });

    // Subscribe to topics
    await kafka.consumer.subscribe(["test-topic"]);

    // Listen for messages
    kafka.consumer.on("message", (messageData) => {
      console.log("Received message:", messageData);
    });

    // Keep running for a bit to receive messages
    setTimeout(async () => {
      await kafka.disconnect();
    }, 5000);
  } catch (error) {
    console.error("Error:", error);
    await kafka.disconnect();
  }
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  example().catch(console.error);
}