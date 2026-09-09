import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly db: DatabaseService) {}

  getOrganization(orgId: string) {
    const org = this.db.get<any>('SELECT * FROM organizations WHERE id = ?', [orgId]);
    if (!org) {
      throw new NotFoundException({
        code: 'ORGANIZATION_NOT_FOUND',
        message: 'Organization not found',
      });
    }
    return org;
  }

  updateOrganization(orgId: string, data: any) {
    const org = this.getOrganization(orgId);
    const now = new Date().toISOString();

    const name = data.name ?? org.name;
    const legal_name = data.legal_name ?? org.legal_name;
    const tax_id = data.tax_id ?? org.tax_id;
    const phone = data.phone ?? org.phone;
    const email = data.email ?? org.email;
    const address = data.address ?? org.address;
    const logo_url = data.logo_url ?? org.logo_url;
    const timezone = data.timezone ?? org.timezone;
    const currency = data.currency ?? org.currency;
    const status = data.status ?? org.status;

    this.db.run(
      `UPDATE organizations
       SET name = ?, legal_name = ?, tax_id = ?, phone = ?, email = ?, address = ?, logo_url = ?, timezone = ?, currency = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [name, legal_name, tax_id, phone, email, address, logo_url, timezone, currency, status, now, orgId],
    );

    return this.getOrganization(orgId);
  }
}
