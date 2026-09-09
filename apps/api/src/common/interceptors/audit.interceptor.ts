import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DatabaseService } from '../../database/database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly db: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;

    // Only audit mutating methods or sensitive actions
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const path = req.path || req.url;
    // Skip health, auth/login, websocket
    if (path.includes('/health') || path.includes('/auth/login')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: (result) => {
          this.logAudit(req, result);
        },
        error: () => {
          // Log failed attempt if needed
        },
      }),
    );
  }

  private logAudit(req: any, result: any) {
    try {
      const user = req.user;
      if (!user || !user.organization_id) return;

      const path = req.path || req.url;
      const parts = path.split('/').filter(Boolean);
      // Example: /api/v1/vehicles/:id -> entity_type = 'vehicles'
      const entityType = parts[2] || 'unknown';
      const entityId = req.params?.id || (result?.data?.id) || (result?.id) || 'bulk';

      let action = 'mutation';
      if (req.method === 'POST') action = 'create';
      if (req.method === 'PATCH' || req.method === 'PUT') action = 'update';
      if (req.method === 'DELETE') action = 'delete';
      if (path.includes('/restore')) action = 'restore';
      if (path.includes('/complete')) action = 'complete';

      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'internal';

      this.db.run(
        `INSERT INTO audit_logs (id, organization_id, location_id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          user.organization_id,
          user.location_id || null,
          user.id,
          action,
          entityType,
          String(entityId),
          null,
          req.body ? JSON.stringify(this.sanitizeBody(req.body)) : null,
          String(ip),
          String(userAgent),
          new Date().toISOString(),
        ],
      );
    } catch (err) {
      // Don't fail the request if audit log fails, but log error
      console.error('Failed to write audit log:', err);
    }
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;
    const sanitized = { ...body };
    delete sanitized.password;
    delete sanitized.password_hash;
    delete sanitized.refreshToken;
    return sanitized;
  }
}
