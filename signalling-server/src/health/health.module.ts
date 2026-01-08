import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceConfig } from 'src/libs/database/datasource.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(DataSourceConfig()),
    TerminusModule,
    HttpModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
