import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KAFKA_SERVICE } from './kafka.constants';

export interface KafkaClientOptions {
  clientId: string;
  groupId: string;
}

@Module({})
export class KafkaClientModule {
  static register(options: KafkaClientOptions): DynamicModule {
    return {
      module: KafkaClientModule,
      imports: [
        ClientsModule.registerAsync([
          {
            name: KAFKA_SERVICE,
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
              transport: Transport.KAFKA,
              options: {
                client: {
                  clientId: options.clientId,
                  brokers: [
                    config.get<string>('KAFKA_BROKER', 'localhost:9092'),
                  ],
                },
                consumer: { groupId: options.groupId },
                producer: { allowAutoTopicCreation: true },
              },
            }),
            inject: [ConfigService],
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }
}
