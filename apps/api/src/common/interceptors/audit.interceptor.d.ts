import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { DatabaseService } from '../../database/database.service';
export declare class AuditInterceptor implements NestInterceptor {
    private readonly db;
    constructor(db: DatabaseService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private logAudit;
    private sanitizeBody;
}
