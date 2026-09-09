import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class AppWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribe(client: Socket, payload: {
        organizationId?: string;
        locationId?: string;
        userId?: string;
    }): {
        organizationId?: string;
        locationId?: string;
        userId?: string;
        status: string;
    };
    emitToOrganization(organizationId: string, event: string, data: any): void;
    emitToUser(userId: string, event: string, data: any): void;
}
