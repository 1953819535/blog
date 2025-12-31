import { plainToClass } from 'class-transformer';
import { IsString, IsNotEmpty, IsPort, IsEmail, validateSync, IsOptional } from 'class-validator';

/**
 * 环境变量验证类
 * 确保所有必需的环境变量都已正确配置
 */
class EnvironmentVariables {
  // Server configuration
  @IsPort()
  @IsOptional()
  PORT: string = '3010';

  // Database
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  // Redis
  @IsString()
  @IsNotEmpty()
  REDIS_URL: string;

  // JWT
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '1d';

  // Bcrypt
  @IsString()
  @IsOptional()
  BCRYPT_SALT_ROUNDS: string = '10';

  // Email
  @IsString()
  @IsNotEmpty()
  RESEND_API_KEY: string;

  @IsEmail()
  @IsNotEmpty()
  MAIL_FROM_ADDRESS: string;
}

/**
 * 验证环境变量
 * @param config - 原始环境变量对象
 * @returns 验证后的环境变量对象
 * @throws 如果验证失败则抛出错误
 */
export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const missingVars = errors.map((error) => {
      const constraints = Object.values(error.constraints || {});
      return `  - ${error.property}: ${constraints.join(', ')}`;
    });

    throw new Error(
      `❌ Environment variable validation failed:\n${missingVars.join('\n')}\n\n` +
        `Please check your .env file and ensure all required variables are set.`,
    );
  }

  return validatedConfig;
}
