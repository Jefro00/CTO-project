import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: '*',
  },
})
export class AppWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AppWebSocketGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from WebSocket: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    client: Socket,
    payload: { organizationId?: string; locationId?: string; userId?: string },
  ) {
    if (payload.organizationId) {
      client.join(`org:${payload.organizationId}`);
    }
    if (payload.locationId) {
      client.join(`loc:${payload.locationId}`);
    }
    if (payload.userId) {
      client.join(`user:${payload.userId}`);
    }
    return { status: 'subscribed', ...payload };
  }

  emitToOrganization(organizationId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`org:${organizationId}`).emit(event, data);
      this.server.emit(event, data); // also broadcast for direct single-tenant sessions
    }
  }

  emitToUser(userId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`user:${userId}`).emit(event, data);
    }
  }
}
