import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebrtcService } from './webrtc.service';
import { MessageBusService } from './message-bus.service';
import { JwtVerifierService } from './jwks';

@WebSocketGateway({ cors: true })
export class WebrtcGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  async afterInit(server: Server) {
    server.use(async (socket, next) => {
      try {
        console.log("Authenticating socket connection ...");
        const token = socket.handshake.auth.token;
        if (!token) {
          console.log("Bro is trying to sneak in without a token!");
          return next(new Error('Missing authentication token'));
        }
        const payload = await this.jwtService.verify(token);
        socket.data.user = payload;
        console.log(`Socket authenticated: ${socket.id}, user.sub: ${payload.sub}`);
        next();
      } catch (error) {
        console.log(`Socket authentication failed:`, error);
        next(new Error(`Authentication failed: ${error.message}`));
      }
    });

    server.on('connection', (socket: Socket) => {
      socket.onAny((event, ...args) => {
        console.log(`[SERVER-IN] ${socket.data.user.preferred_username}@${socket.id} -> event "${event}"`, args);
      });
    });

    // wait for messageBus to connect
    await new Promise(resolve => setTimeout(resolve, 1000));

    // NOTE: Do we even need broadcasts?
    this.messageBus.subscribe("broadcast", (msg) => {
      this.server.emit(msg.event, msg.payload);
      console.log(`[SERVER-OUT] broadcast <- event "${msg.event}"`, msg.payload);
    });
  }
  constructor(
    private readonly webrtcService: WebrtcService,
    private readonly messageBus: MessageBusService,
    private readonly jwtService: JwtVerifierService,
  ) {}

  handleConnection(client: Socket) {
    const user = client.data.user;
    console.log(`Client connected: ${client.id}, username: ${user.preferred_username} sub: ${user.sub}`);
    this.messageBus.subscribe(user.sub, (msg) => {
      client.emit(msg.event, msg.payload);
      console.log(`[SERVER-OUT] ${client.data.user.preferred_username}@${client.id} <- event "${msg.event}"`, msg.payload);
    });
    client.emit("hello", "test message");
    this.webrtcService.addClient(client.id);
  }

  handleDisconnect(client: Socket) {
    this.webrtcService.removeClient(client.id);
    this.messageBus.unsubscribe(client.data.user.sub);
  }

  @SubscribeMessage('start-call-req')
  handleStartCallReq(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { targetUserId: string },
  ) {
    this.messageBus.publish(payload.targetUserId, {
      event: 'start-call-req',
      payload: {
        from: client.data.user.sub,
      },
    });
  }

  @SubscribeMessage('start-call-acc')
  handleStartCallRes(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { targetUserId: string },
  ) {
    // A member of the room has accepted the call
    // client.to(payload.room)
    this.messageBus.publish(payload.targetUserId, {
      event: 'start-call-acc',
      payload: {
        from: client.data.user.sub,
      },
    });
  }

  @SubscribeMessage('start-call-rej')
  handleStartCallRej(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { targetUserId: string },
  ) {
    // A member of the room has accepted the call
    this.messageBus.publish(payload.targetUserId, {
      event: 'start-call-rej',
      payload: {
        from: client.data.user.sub,
      },
    });
  }

  @SubscribeMessage('RTC-offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { offer: string; targetUserId: string },
  ) {
    // forward to a specific room peer
    this.messageBus.publish(payload.targetUserId, {
      event: 'RTC-offer',
      payload: {
        from: client.data.user.sub,
        offer: payload.offer,
      },
    });
  }

  @SubscribeMessage('RTC-answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { answer: string; targetUserId: string },
  ) {
    this.messageBus.publish(payload.targetUserId, {
      event: 'RTC-answer',
      payload: {
        from: client.data.user.sub,
        answer: payload.answer,
      },
    });
  }

  @SubscribeMessage('RTC-ice')
  handleIce(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { candidate: string; targetUserId: string },
  ) {
    this.messageBus.publish(payload.targetUserId, {
      event: 'RTC-ice',
      payload: {
        from: client.data.user.sub,
        candidate: payload.candidate,
      },
    });
  }

  @SubscribeMessage('chat')
  handleChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { message: string; targetUserId: string },
  ) {
    this.messageBus.publish(payload.targetUserId, {
      event: 'chat',
      payload: {
        from: client.data.user.sub,
        message: payload.message,
      },
    });
  }
}
