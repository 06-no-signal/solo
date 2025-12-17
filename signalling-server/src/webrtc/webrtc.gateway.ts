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

@WebSocketGateway({ cors: true })
export class WebrtcGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.on('connection', (socket: Socket) => {
      socket.onAny((event, ...args) => {
        console.log(`[SERVER-IN] ${socket.id} -> event "${event}"`, args);
      });
    });
  }
  constructor(private readonly webrtcService: WebrtcService) {}

  handleConnection(client: Socket) {
    this.webrtcService.addClient(client.id);
  }

  handleDisconnect(client: Socket) {
    this.webrtcService.removeClient(client.id);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string },
  ) {
    client.join(payload.room);
    client.to(payload.room).emit('peer-joined', client.id);
  }

  @SubscribeMessage('start-call-req')
  handleStartCallReq(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string },
  ) {
    // TODO: Forward this to only members of room
    client.broadcast.emit('start-call-req', {
      from: client.id,
      room: payload.room,
    });
  }

  @SubscribeMessage('start-call-acc')
  handleStartCallRes(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string },
  ) {
    // A member of the room has accepted the call
    // client.to(payload.room)
    client.to(payload.room).emit('start-call-acc', {
      from: client.id,
      room: payload.room,
    });
  }
  @SubscribeMessage('start-call-rej')
  handleStartCallRej(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string },
  ) {
    // A member of the room has accepted the call
    client.to(payload.room).emit('start-call-rej', {
      from: client.id,
      room: payload.room,
    });
  }

  @SubscribeMessage('RTC-offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { offer: string; room: string },
  ) {
    // forward to a specific room peer
    client.to(payload.room).emit('RTC-offer', {
      from: client.id,
      offer: payload.offer,
    });
  }

  @SubscribeMessage('RTC-answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { answer: string; room: string },
  ) {
    client.to(payload.room).emit('RTC-answer', {
      from: client.id,
      answer: payload.answer,
    });
  }

  @SubscribeMessage('RTC-ice')
  handleIce(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { candidate: string; room: string },
  ) {
    client.to(payload.room).emit('RTC-ice', {
      from: client.id,
      candidate: payload.candidate,
    });
  }

  @SubscribeMessage('chat')
  handleChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { message: string; room: string },
  ) {
    this.server.to(payload.room).emit('chat', {
      from: client.id,
      message: payload.message,
    });
  }
}
