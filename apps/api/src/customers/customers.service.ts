import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CustomersService {
  constructor(private readonly db: DatabaseService) {}

  getAll(orgId: string, query?: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 25));
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM customers WHERE organization_id = ? AND deleted_at IS NULL';
    const params: any[] = [orgId];

    if (query?.search) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      const s = `%${query.search.trim()}%`;
      params.push(s, s, s, s);
    }

    const countRow = this.db.get<any>(
      `SELECT COUNT(*) as total FROM (${sql})`,
      params,
    );
    const total = countRow?.total || 0;

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const customers = this.db.all<any>(sql, params);

    // Attach vehicle counts
    const result = customers.map((c) => {
      const vehicles = this.db.all<any>(
        'SELECT * FROM vehicles WHERE customer_id = ? AND deleted_at IS NULL',
        [c.id],
      );
      return {
        ...c,
        vehicles,
      };
    });

    return {
      data: result,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  search(orgId: string, q: string) {
    const s = `%${q.trim()}%`;
    const customers = this.db.all<any>(
      `SELECT * FROM customers
       WHERE organization_id = ? AND deleted_at IS NULL
         AND (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?)
       ORDER BY first_name ASC LIMIT 20`,
      [orgId, s, s, s, s],
    );

    return customers.map((c) => {
      const vehicles = this.db.all<any>(
        'SELECT * FROM vehicles WHERE customer_id = ? AND deleted_at IS NULL',
        [c.id],
      );
      return {
        ...c,
        vehicles,
      };
    });
  }

  getById(orgId: string, id: string) {
    const customer = this.db.get<any>(
      'SELECT * FROM customers WHERE id = ? AND organization_id = ? AND deleted_at IS NULL',
      [id, orgId],
    );

    if (!customer) {
      throw new NotFoundException({
        code: 'CUSTOMER_NOT_FOUND',
        message: 'Customer not found',
      });
    }

    const vehicles = this.db.all<any>(
      'SELECT * FROM vehicles WHERE customer_id = ? AND deleted_at IS NULL ORDER BY created_at DESC',
      [id],
    );

    const workOrders = this.db.all<any>(
      'SELECT * FROM work_orders WHERE customer_id = ? ORDER BY opened_at DESC LIMIT 10',
      [id],
    );

    return {
      ...customer,
      vehicles,
      workOrders,
    };
  }

  create(orgId: string, data: any) {
    const id = uuidv4();
    const now = new Date().toISOString();

    this.db.run(
      `INSERT INTO customers (id, organization_id, first_name, last_name, phone, email, address, notes, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        orgId,
        data.first_name,
        data.last_name,
        data.phone,
        data.email || null,
        data.address || null,
        data.notes || null,
        data.status || 'active',
        now,
        now,
      ],
    );

    return this.getById(orgId, id);
  }

  update(orgId: string, id: string, data: any) {
    const customer = this.getById(orgId, id);
    const now = new Date().toISOString();

    const firstName = data.first_name ?? customer.first_name;
    const lastName = data.last_name ?? customer.last_name;
    const phone = data.phone ?? customer.phone;
    const email = data.email !== undefined ? data.email : customer.email;
    const address = data.address !== undefined ? data.address : customer.address;
    const notes = data.notes !== undefined ? data.notes : customer.notes;
    const status = data.status ?? customer.status;

    this.db.run(
      `UPDATE customers
       SET first_name = ?, last_name = ?, phone = ?, email = ?, address = ?, notes = ?, status = ?, updated_at = ?
       WHERE id = ? AND organization_id = ?`,
      [firstName, lastName, phone, email, address, notes, status, now, id, orgId],
    );

    return this.getById(orgId, id);
  }

  delete(orgId: string, id: string) {
    this.getById(orgId, id);
    const now = new Date().toISOString();
    this.db.run(
      'UPDATE customers SET deleted_at = ?, updated_at = ? WHERE id = ? AND organization_id = ?',
      [now, now, id, orgId],
    );
    return { success: true, message: 'Customer marked as deleted' };
  }
}
