import { StartProcessingData } from '@app/types';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { DocumentDto } from 'src/libs/dto';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({
    clientId: 'gateway-service',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
    retry: { retries: 5 },
  });

  private producer = this.kafka.producer();
  private consumer = this.kafka.consumer({ groupId: 'gateway-service' });

  async onModuleInit() {
    await this.consumer.subscribe({ topics: ['processing-failed'] });
    await this.producer.connect();
    await this.consumer.connect();

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        console.log(`Received message: ${message}`);
      },
    });
  }

  async sendMessage(input: { topic: string; message: string }) {
    const { topic, message } = input;
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  async startProcessing(input: { topic: string; message: DocumentDto }) {
    const { topic, message } = input;
    const { id, key, mimeType } = message;
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(<StartProcessingData>{
            docId: id,
            mimeType,
            key,
          }),
        },
      ],
    });
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }
}
