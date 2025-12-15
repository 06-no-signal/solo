import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WebrtcModule } from './webrtc/webrtc.module';

@Module({
  imports: [WebrtcModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
