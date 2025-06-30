import { defaultKafkaConfig } from "./config/kafkaConfig.js";
import { KafkaAdminService } from "./services/KafkaAdminService.js";
import { KafkaProducerService } from "./services/KafkaProducerService.js";
import { KafkaConsumerService } from "./services/KafkaConsumerService.js";
import { KafkaOutputMonitor } from "./services/KafkaOutputMonitor.js";

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
  KafkaOutputMonitor,
} from "./services/index.js";

export {
  // Types
  type FlowOutput,
  type TopicStats,
} from "./services/KafkaOutputMonitor.js";

// Main class that combines all services
export class KafkaService {
  public admin: KafkaAdminService;
  public producer: KafkaProducerService;
  public consumer: KafkaConsumerService;
  public monitor: KafkaOutputMonitor;

  constructor(config = defaultKafkaConfig) {
    this.admin = new KafkaAdminService(config);
    this.producer = new KafkaProducerService(config);
    this.consumer = new KafkaConsumerService(config);
    this.monitor = new KafkaOutputMonitor(config);
  }

  /**
   * Disconnect all services
   */
  async disconnect(): Promise<void> {
    await Promise.all([
      this.admin.disconnect(),
      this.producer.disconnect(),
      this.consumer.disconnect(),
      this.monitor.disconnect(),
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

    // Start monitoring
    await kafka.monitor.startMonitoring();

    // Listen for messages
    kafka.monitor.on("flow-output", (output) => {
      console.log("Received output:", output);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Clean up
    await kafka.disconnect();
  }
}

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  example().catch(console.error);
}