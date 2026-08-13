import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';

@Injectable()
export class RoomManagerService {
  private rooms = new Map<string, Set<WebSocket>>();
  private operatorQueue = new Set<WebSocket>();

  addOperator(socket: WebSocket) {
    this.operatorQueue.add(socket);
  }

  removeOperator(socket: WebSocket) {
    this.operatorQueue.delete(socket);
  }

  joinRoom(roomId: string, socket: WebSocket) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(socket);
  }

  leaveRoom(roomId: string, socket: WebSocket) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(socket);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  broadcastToRoom(roomId: string, payload: any) {
    const clients = this.rooms.get(roomId);
    if (!clients) return;
    const data = JSON.stringify(payload);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  broadcastToOperators(payload: any) {
    const data = JSON.stringify(payload);
    this.operatorQueue.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}
