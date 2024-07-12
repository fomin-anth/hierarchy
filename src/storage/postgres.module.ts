import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigVariables } from './DatabaseConfigVariables';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          database: config.get(DatabaseConfigVariables.database),
          host: config.get(DatabaseConfigVariables.host),
          username: config.get(DatabaseConfigVariables.db_user),
          password: config.get(DatabaseConfigVariables.password),
          entities: [join(__dirname, '..', '**/*.entity.{js,ts}')],
          migrations: [join(__dirname, '**/*.migration.{js,ts}')],
          migrationsRun: true,
          synchronize: false,
          logging: true,
        };
      },
    }),
  ],
})
export class PostgresModule {
  constructor() {}
}
