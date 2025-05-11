import { registerAs } from '@nestjs/config';
import { IsEnum, IsInt, IsString, IsUrl, Min, validateSync } from 'class-validator';
import { plainToClass } from 'class-transformer';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsInt()
  @Min(1)
  PORT: number;

  @IsString()
  API_PREFIX: string;

  @IsString()
  API_VERSION: string;

  @IsString()
  DB_HOST: string;

  @IsInt()
  @Min(1)
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRATION: string;

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsUrl()
  GOOGLE_CALLBACK_URL: string;

  @IsInt()
  @Min(1)
  THROTTLE_TTL: number;

  @IsInt()
  @Min(1)
  THROTTLE_LIMIT: number;

  @IsInt()
  @Min(1)
  CACHE_TTL: number;

  @IsInt()
  @Min(1)
  CACHE_MAX: number;

  @IsString()
  LOG_LEVEL: string;

  @IsString()
  LOG_FORMAT: string;

  @IsString()
  CORS_ORIGIN: string;

  @IsString()
  CORS_METHODS: string;

  @IsString()
  SWAGGER_TITLE: string;

  @IsString()
  SWAGGER_DESCRIPTION: string;

  @IsString()
  SWAGGER_VERSION: string;

  @IsString()
  SWAGGER_PATH: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || Environment.Development,
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  apiVersion: process.env.API_VERSION || 'v1',
  isDevelopment: process.env.NODE_ENV === Environment.Development,
  isProduction: process.env.NODE_ENV === Environment.Production,
  isTest: process.env.NODE_ENV === Environment.Test,
})); 