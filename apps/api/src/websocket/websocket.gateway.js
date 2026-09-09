"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AppWebSocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppWebSocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let AppWebSocketGateway = AppWebSocketGateway_1 = class AppWebSocketGateway {
    server;
    logger = new common_1.Logger(AppWebSocketGateway_1.name);
    handleConnection(client) {
        this.logger.log(`Client connected to WebSocket: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected from WebSocket: ${client.id}`);
    }
    handleSubscribe(client, payload) {
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
    emitToOrganization(organizationId, event, data) {
        if (this.server) {
            this.server.to(`org:${organizationId}`).emit(event, data);
            this.server.emit(event, data); // also broadcast for direct single-tenant sessions
        }
    }
    emitToUser(userId, event, data) {
        if (this.server) {
            this.server.to(`user:${userId}`).emit(event, data);
        }
    }
};
exports.AppWebSocketGateway = AppWebSocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AppWebSocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], AppWebSocketGateway.prototype, "handleSubscribe", null);
exports.AppWebSocketGateway = AppWebSocketGateway = AppWebSocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/ws',
        cors: {
            origin: '*',
        },
    })
], AppWebSocketGateway);
//# sourceMappingURL=websocket.gateway.js.map