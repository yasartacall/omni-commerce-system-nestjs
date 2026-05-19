import { utilities, WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import ecsFormat from '@elastic/ecs-winston-format';
import { ElasticsearchTransport } from 'winston-elasticsearch';

export function createWinstonOptions(
  serviceName: string,
): WinstonModuleOptions {
  const useJson =
    process.env['NODE_ENV'] === 'production' ||
    process.env['LOG_FORMAT'] === 'json';

  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: useJson
        ? ecsFormat({ serviceName })
        : winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike(serviceName, {
              prettyPrint: true,
              colors: true,
            }),
          ),
    }),
  ];

  const esUrl = process.env['ELASTICSEARCH_URL'];
  if (esUrl) {
    transports.push(
      new ElasticsearchTransport({
        level: 'info',
        clientOpts: { node: esUrl },
        index: `omni-logs-${serviceName}`,
        transformer: (logData) => ({
          '@timestamp': new Date().toISOString(),
          'log.level': logData.level,
          message: logData.message,
          'service.name': serviceName,
          ...((logData.meta as Record<string, unknown>) ?? {}),
        }),
      }),
    );
  }

  return {
    level: process.env['LOG_LEVEL'] ?? 'info',
    transports,
  };
}
