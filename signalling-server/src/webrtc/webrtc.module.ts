import { Module } from '@nestjs/common';
import { WebrtcGateway } from './webrtc.gateway';
import { WebrtcService } from './webrtc.service';
import { MessageBusService } from './message-bus.service';

@Module({
  providers: [WebrtcGateway, WebrtcService, MessageBusService],
})
export class WebrtcModule {}
