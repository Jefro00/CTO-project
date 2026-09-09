import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SearchService {
  constructor(private readonly db: DatabaseService) {}

  search(orgId: string, q: string) {
    if (!q || !q.trim()) {
      return {
        vehicles: [],
        customers: [],
        workOrders: [],
        documents: [],
      };
    }

    const s = `%${q.trim()}%`;

    // 1. Vehicles
    const vehicles = this.db.all<any>(
      `SELECT v.*, c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone
       FROM vehicles v
       JOIN customers c ON v.customer_id = c.id
       WHERE v.organization_id = ? AND v.deleted_at IS NULL
         AND (
           LOWER(v.vin) LIKE LOWER(?) OR
           LOWER(v.license_plate) LIKE LOWER(?) OR
           LOWER(v.make) LIKE LOWER(?) OR
           LOWER(v.model) LIKE LOWER(?)
         )
       LIMIT 10`,
      [orgId, s, s, s, s],
    );

    // 2. Customers
    const customers = this.db.all<any>(
      `SELECT * FROM customers
       WHERE organization_id = ? AND deleted_at IS NULL
         AND (
           LOWER(first_name) LIKE LOWER(?) OR
           LOWER(last_name) LIKE LOWER(?) OR
           phone LIKE ? OR
           LOWER(email) LIKE LOWER(?)
         )
       LIMIT 10`,
      [orgId, s, s, s, s],
    );

    // 3. Work Orders
    const workOrders = this.db.all<any>(
      `SELECT w.*, v.make as vehicle_make, v.model as vehicle_model, v.license_plate as vehicle_plate,
              c.first_name as customer_first_name, c.last_name as customer_last_name
       FROM work_orders w
       JOIN vehicles v ON w.vehicle_id = v.id
       JOIN customers c ON w.customer_id = c.id
       WHERE w.organization_id = ?
         AND (
           w.number LIKE ? OR
           LOWER(w.customer_complaint) LIKE LOWER(?) OR
           LOWER(w.diagnosis) LIKE LOWER(?) OR
           LOWER(v.license_plate) LIKE LOWER(?)
         )
       LIMIT 10`,
      [orgId, s, s, s, s],
    );

    // 4. Documents
    const documents = this.db.all<any>(
      `SELECT d.*, v.license_plate as vehicle_plate, c.first_name as customer_first_name, c.last_name as customer_last_name
       FROM documents d
       JOIN vehicles v ON d.vehicle_id = v.id
       JOIN customers c ON d.customer_id = c.id
       WHERE d.organization_id = ? AND d.deleted_at IS NULL
         AND (
           LOWER(d.name) LIKE LOWER(?) OR
           LOWER(d.type) LIKE LOWER(?) OR
           LOWER(v.license_plate) LIKE LOWER(?)
         )
       LIMIT 10`,
      [orgId, s, s, s],
    );

    return {
      vehicles: vehicles.map((v) => ({
        ...v,
        customer: {
          id: v.customer_id,
          first_name: v.customer_first_name,
          last_name: v.customer_last_name,
          phone: v.customer_phone,
        },
      })),
      customers,
      workOrders: workOrders.map((w) => ({
        ...w,
        vehicle: {
          id: w.vehicle_id,
          make: w.vehicle_make,
          model: w.vehicle_model,
          license_plate: w.vehicle_plate,
        },
        customer: {
          id: w.customer_id,
          first_name: w.customer_first_name,
          last_name: w.customer_last_name,
        },
      })),
      documents,
    };
  }
}
