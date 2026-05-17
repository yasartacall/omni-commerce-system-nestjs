import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => ({
            type: 'postgres' as const,
            host: config.get<string>('DB_HOST', 'localhost'),
            port: config.get<number>('DB_PORT', 5432),
            username: config.get<string>('DB_USER', 'postgres'),
            password: config.get<string>('DB_PASSWORD', 'postgres'),
            database: config.get<string>('DB_NAME'),
            autoLoadEntities: true,
            synchronize: config.get<string>('NODE_ENV') !== 'production',
            logging: config.get<string>('NODE_ENV') === 'development',
          }),
          inject: [ConfigService],
        }),
      ],
    };
  }
}
