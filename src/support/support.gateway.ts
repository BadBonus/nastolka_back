import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { RoomManagerService } from './support.roomManager.service';
import { MessageBatchService } from './support.messageBatch.service';
import * as cookie from 'cookie';
import { TokenService } from '@/shared/token/token.service';

@WebSocketGateway({ path: '/ws' })
export class SupportGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private roomManager: RoomManagerService,
    private batchService: MessageBatchService,
    private tokenService: TokenService,
  ) {}

  async handleConnection(client: WebSocket, req: IncomingMessage) {
    try {
      const rawCookies = req.headers.cookie;
      if (!rawCookies) {
        client.close(4001, 'Unauthorized');
        return;
      }
      const parsed = cookie.parse(rawCookies);
      const token = parsed['access_token'];

      // Тут нужна логика определения прав
    } catch {
      client.close(4001, 'Unauthorized');
    }
  }

  handleDisconnect(client: WebSocket) {
    // Логика отключения
  }

  @SubscribeMessage('join_ticket')
  handleJoinTicket(client: WebSocket, payload: { ticketId: string }) {
    // Логика входа в комнату
  }

  @SubscribeMessage('send_message')
  handleMessage(
    client: WebSocket,
    payload: { ticketId: string; content: string },
  ) {
    // Логика отправки
  }
}
