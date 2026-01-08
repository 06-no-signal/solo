import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WebrtcModule } from './webrtc/webrtc.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TenancyModule } from './libs/tenancy/tenancy.module';
import { DatabaseModule } from './libs/database/database.module';
import { UsersModule } from './db-components/users/users.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    WebrtcModule,
    ConfigModule.forRoot(),
    TenancyModule,
    DatabaseModule,
    UsersModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
