import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({
    clientId: 'gateway-service',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
  });

  private producer = this.kafka.producer();
  private consumer = this.kafka.consumer({ groupId: 'gateway-service' });

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();

    this.consumer.run({
      eachMessage: async ({ message }) => {
        console.log(`Received message: ${message.value?.toString()}`);
      },
    });
  }

  async sendMessage(topic: string, message: string) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }
}
