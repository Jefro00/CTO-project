import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocationsService {
  constructor(private readonly db: DatabaseService) {}

  getAll(orgId: string) {
    return this.db.all<any>(
      'SELECT * FROM locations WHERE organization_id = ? ORDER BY created_at ASC',
      [orgId],
    );
  }

  getById(orgId: string, id: string) {
    const loc = this.db.get<any>(
      'SELECT * FROM locations WHERE id = ? AND organization_id = ?',
      [id, orgId],
    );
    if (!loc) {
      throw new NotFoundException({
        code: 'LOCATION_NOT_FOUND',
        message: 'Location / Branch not found',
      });
    }
    return loc;
  }

  create(orgId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();
    this.db.run(
      `INSERT INTO locations (id, organization_id, name, city, address, phone, email, timezone, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        orgId,
        data.name,
        data.city || null,
        data.address || null,
        data.phone || null,
        data.email || null,
        data.timezone || 'UTC+3',
        data.status || 'active',
        now,
        now,
      ],
    );
    return this.getById(orgId, id);
  }

  update(orgId: string, id: string, data: any) {
    const loc = this.getById(orgId, id);
    const now = new Date().toISOString();

    const name = data.name ?? loc.name;
    const city = data.city ?? loc.city;
    const address = data.address ?? loc.address;
    const phone = data.phone ?? loc.phone;
    const email = data.email ?? loc.email;
    const timezone = data.timezone ?? loc.timezone;
    const status = data.status ?? loc.status;

    this.db.run(
      `UPDATE locations
       SET name = ?, city = ?, address = ?, phone = ?, email = ?, timezone = ?, status = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`,
      [name, city, address, phone, email, timezone, status, now, id, orgId],
    );

    return this.getById(orgId, id);
  }

  delete(orgId: string, id: string) {
    this.getById(orgId, id);
    this.db.run('DELETE FROM locations WHERE id = ? AND organization_id = ?', [id, orgId]);
    return { success: true, message: 'Location deleted successfully' };
  }
}
