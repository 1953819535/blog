import { Params } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

/**
 * 日志配置
 */
export const loggerConfig = (configService: ConfigService): Params => {
  const nodeEnv = configService.get('NODE_ENV');

  // 输出日志服务初始化成功信息
  console.log('✅ Logger service initialized successfully');

  return {
    pinoHttp: {
      transport: nodeEnv !== 'production'
        ? { target: 'pino-pretty' }
        : undefined,
      level: nodeEnv !== 'production' ? 'debug' : 'info',
      autoLogging: true,
    },
  }
}