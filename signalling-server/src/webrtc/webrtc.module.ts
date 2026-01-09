import { Module } from '@nestjs/common';
import { WebrtcGateway } from './webrtc.gateway';
import { WebrtcService } from './webrtc.service';
import { MessageBusService } from './message-bus.service';
import { JwtVerifierService } from './jwks';
import { UsersModule } from 'src/db-components/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [
    WebrtcGateway,
    WebrtcService,
    MessageBusService,
    JwtVerifierService,
  ],
})
export class WebrtcModule {}
