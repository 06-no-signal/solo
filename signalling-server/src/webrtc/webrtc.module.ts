import { Module } from '@nestjs/common';
import { WebrtcGateway } from './webrtc.gateway';
import { WebrtcService } from './webrtc.service';
import { MessageBusService } from './message-bus.service';
import { JwtVerifierService } from './jwks';

@Module({
  providers: [WebrtcGateway, WebrtcService, MessageBusService, JwtVerifierService],
})
export class WebrtcModule {}
