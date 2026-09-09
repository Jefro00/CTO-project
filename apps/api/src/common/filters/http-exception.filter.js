"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let code = 'INTERNAL_SERVER_ERROR';
        let message = 'An unexpected error occurred';
        let details = undefined;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
                code = this.statusCodeToCode(status);
            }
            else if (typeof res === 'object' && res !== null) {
                const anyRes = res;
                message = anyRes.message || exception.message;
                code = anyRes.code || anyRes.error || this.statusCodeToCode(status);
                details = anyRes.details || (Array.isArray(anyRes.message) ? anyRes.message : undefined);
            }
        }
        else if (exception instanceof Error) {
            this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
            message = exception.message;
        }
        response.status(status).json({
            error: {
                code,
                message: Array.isArray(message) ? message.join(', ') : message,
                ...(details ? { details } : {}),
            },
        });
    }
    statusCodeToCode(status) {
        switch (status) {
            case common_1.HttpStatus.BAD_REQUEST:
                return 'BAD_REQUEST';
            case common_1.HttpStatus.UNAUTHORIZED:
                return 'UNAUTHORIZED';
            case common_1.HttpStatus.FORBIDDEN:
                return 'FORBIDDEN';
            case common_1.HttpStatus.NOT_FOUND:
                return 'NOT_FOUND';
            case common_1.HttpStatus.CONFLICT:
                return 'CONFLICT';
            case common_1.HttpStatus.UNPROCESSABLE_ENTITY:
                return 'UNPROCESSABLE_ENTITY';
            case common_1.HttpStatus.TOO_MANY_REQUESTS:
                return 'TOO_MANY_REQUESTS';
            default:
                return 'INTERNAL_SERVER_ERROR';
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map