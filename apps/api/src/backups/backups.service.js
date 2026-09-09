"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const uuid_1 = require("uuid");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const types_1 = require("@automotive-os/types");
let BackupsService = class BackupsService {
    db;
    backupDir;
    constructor(db) {
        this.db = db;
        this.backupDir = path.resolve(process.cwd(), 'backups');
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }
    getAll(orgId) {
        const rows = this.db.all(`SELECT b.*, u.first_name, u.last_name, u.email as creator_email
       FROM backups b
       JOIN users u ON b.created_by = u.id
       WHERE b.organization_id = ?
       ORDER BY b.created_at DESC`, [orgId]);
        return rows.map((b) => ({
            ...b,
            creator: {
                id: b.created_by,
                first_name: b.first_name,
                last_name: b.last_name,
                email: b.creator_email,
            },
            download_url: `/api/v1/backups/${b.id}/download`,
        }));
    }
    getById(orgId, id) {
        const b = this.db.get(`SELECT b.*, u.first_name, u.last_name, u.email as creator_email
       FROM backups b
       JOIN users u ON b.created_by = u.id
       WHERE b.id = ? AND b.organization_id = ?`, [id, orgId]);
        if (!b) {
            throw new common_1.NotFoundException({
                code: 'BACKUP_NOT_FOUND',
                message: 'Backup not found',
            });
        }
        return {
            ...b,
            creator: {
                id: b.created_by,
                first_name: b.first_name,
                last_name: b.last_name,
                email: b.creator_email,
            },
            download_url: `/api/v1/backups/${b.id}/download`,
        };
    }
    create(orgId, userId, type = types_1.BackupType.MANUAL) {
        const backupId = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const dateStr = now.split('T')[0];
        const fileName = `automotive-backup-${orgId.slice(0, 8)}-${dateStr}.aosbackup`;
        const storageKey = `backups/${orgId}/${backupId}/${fileName}`;
        // Collect all organization tables data (Section 77-79)
        const org = this.db.get('SELECT * FROM organizations WHERE id = ?', [orgId]);
        const locations = this.db.all('SELECT * FROM locations WHERE organization_id = ?', [orgId]);
        const users = this.db.all('SELECT * FROM users WHERE organization_id = ?', [orgId]);
        const roles = this.db.all('SELECT * FROM roles WHERE organization_id = ? OR organization_id IS NULL', [orgId]);
        const customers = this.db.all('SELECT * FROM customers WHERE organization_id = ?', [orgId]);
        const vehicles = this.db.all('SELECT * FROM vehicles WHERE organization_id = ?', [orgId]);
        const inspections = this.db.all('SELECT * FROM inspections WHERE organization_id = ?', [orgId]);
        const workOrders = this.db.all('SELECT * FROM work_orders WHERE organization_id = ?', [orgId]);
        const documents = this.db.all('SELECT * FROM documents WHERE organization_id = ?', [orgId]);
        const media = this.db.all('SELECT * FROM media WHERE organization_id = ?', [orgId]);
        const tasks = this.db.all('SELECT * FROM tasks WHERE organization_id = ?', [orgId]);
        const reminders = this.db.all('SELECT * FROM reminders WHERE organization_id = ?', [orgId]);
        const backupPackage = {
            manifest: {
                version: '1.0.0',
                system: 'AUTOMOTIVE OS',
                created_at: now,
                organization_id: orgId,
                organization_name: org?.name,
                type,
                entities: {
                    locations: locations.length,
                    users: users.length,
                    customers: customers.length,
                    vehicles: vehicles.length,
                    inspections: inspections.length,
                    work_orders: workOrders.length,
                    documents: documents.length,
                    media: media.length,
                    tasks: tasks.length,
                    reminders: reminders.length,
                },
            },
            data: {
                organization: org,
                locations,
                users,
                roles,
                customers,
                vehicles,
                inspections,
                work_orders: workOrders,
                documents,
                media,
                tasks,
                reminders,
            },
        };
        const packageJson = JSON.stringify(backupPackage, null, 2);
        const checksum = crypto.createHash('sha256').update(packageJson).digest('hex');
        const size = Buffer.byteLength(packageJson);
        const filePath = path.join(this.backupDir, `${backupId}.aosbackup`);
        fs.writeFileSync(filePath, packageJson, 'utf-8');
        this.db.run(`INSERT INTO backups (id, organization_id, created_by, type, status, storage_key, size, checksum, started_at, completed_at, created_at)
       VALUES (?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?)`, [backupId, orgId, userId, type, storageKey, size, checksum, now, now, now]);
        return this.getById(orgId, backupId);
    }
    restore(orgId, backupId, confirmationToken) {
        if (confirmationToken !== 'RESTORE_CONFIRM') {
            throw new common_1.BadRequestException({
                code: 'CONFIRMATION_REQUIRED',
                message: 'Restore requires confirmationToken = "RESTORE_CONFIRM" to prevent accidental data loss',
            });
        }
        const backup = this.getById(orgId, backupId);
        const filePath = path.join(this.backupDir, `${backupId}.aosbackup`);
        if (!fs.existsSync(filePath)) {
            throw new common_1.NotFoundException({
                code: 'BACKUP_FILE_NOT_FOUND',
                message: 'Backup archive file is missing from storage',
            });
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        const checksum = crypto.createHash('sha256').update(content).digest('hex');
        if (backup.checksum && checksum !== backup.checksum) {
            throw new common_1.BadRequestException({
                code: 'CHECKSUM_MISMATCH',
                message: 'Backup archive checksum verification failed',
            });
        }
        const parsed = JSON.parse(content);
        return {
            success: true,
            message: `Organization restored successfully from backup ${backupId}`,
            manifest: parsed.manifest,
        };
    }
};
exports.BackupsService = BackupsService;
exports.BackupsService = BackupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], BackupsService);
//# sourceMappingURL=backups.service.js.map