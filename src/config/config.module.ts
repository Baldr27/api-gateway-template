import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './app.config';
import appConfig from './app.config';
import databaseConfig from './database.config';
import securityConfig from './security.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.development', '.env.production'],
      validate,
      load: [appConfig, databaseConfig, securityConfig],
      cache: true,
      expandVariables: true,
    }),
  ],
})
export class ConfigModule {} 