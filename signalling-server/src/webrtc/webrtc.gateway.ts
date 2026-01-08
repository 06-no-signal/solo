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

@WebSocketGateway({ cors: true })
export class WebrtcGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  async afterInit(server: Server) {
    server.on('connection', (socket: Socket) => {
      socket.onAny((event, ...args) => {
        console.log(`[SERVER-IN] ${socket.id} -> event "${event}"`, args);
      });
    });

    // wait for messageBus to connect
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.messageBus.subscribe("room", (msg) => {
      this.server.to(msg.room).emit(msg.event, msg.payload);
      console.log(`[SERVER-OUT] room "${msg.room}" <- event "${msg.event}"`, msg.payload);
    });
    this.messageBus.subscribe("broadcast", (msg) => {
      this.server.emit(msg.event, msg.payload);
      console.log(`[SERVER-OUT] broadcast <- event "${msg.event}"`, msg.payload);
    });
  }
  constructor(
    private readonly webrtcService: WebrtcService,
    private readonly messageBus: MessageBusService,
  ) {}

  handleConnection(client: Socket) {
    this.messageBus.subscribe(client.id, (msg) => {
      client.to(client.id).emit(msg.event, msg.payload);
      console.log(`[SERVER-OUT] ${client.id} <- event "${msg.event}"`, msg.payload);
    });
    this.webrtcService.addClient(client.id);
  }

  handleDisconnect(client: Socket) {
    this.webrtcService.removeClient(client.id);
    this.messageBus.unsubscribe(client.id);
  }

  @SubscribeMessage('start-call-req')
  handleStartCallReq(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { targetUserId: string },
  ) {
    this.messageBus.publish(payload.targetUserId, {
      event: 'start-call-req',
      payload: {
        from: client.id,
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
        from: client.id,
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
        from: client.id,
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
        from: client.id,
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
        from: client.id,
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
        from: client.id,
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
        from: client.id,
        message: payload.message,
      },
    });
  }
}
