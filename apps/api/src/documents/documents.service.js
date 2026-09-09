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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const uuid_1 = require("uuid");
const crypto = __importStar(require("crypto"));
const types_1 = require("@automotive-os/types");
const websocket_gateway_1 = require("../websocket/websocket.gateway");
let DocumentsService = class DocumentsService {
    db;
    ws;
    constructor(db, ws) {
        this.db = db;
        this.ws = ws;
    }
    getAll(orgId, query) {
        let sql = `
      SELECT d.*, u.first_name as uploader_first_name, u.last_name as uploader_last_name
      FROM documents d
      JOIN users u ON d.uploaded_by = u.id
      WHERE d.organization_id = ? AND d.deleted_at IS NULL
    `;
        const params = [orgId];
        if (query?.vehicle_id) {
            sql += ' AND d.vehicle_id = ?';
            params.push(query.vehicle_id);
        }
        if (query?.work_order_id) {
            sql += ' AND d.work_order_id = ?';
            params.push(query.work_order_id);
        }
        if (query?.customer_id) {
            sql += ' AND d.customer_id = ?';
            params.push(query.customer_id);
        }
        if (query?.type) {
            sql += ' AND d.type = ?';
            params.push(query.type);
        }
        sql += ' ORDER BY d.created_at DESC';
        const rows = this.db.all(sql, params);
        return rows.map((d) => ({
            ...d,
            is_signed: !!d.is_signed,
            download_url: `/api/v1/documents/${d.id}/download-url`,
        }));
    }
    getById(orgId, id) {
        const doc = this.db.get(`SELECT d.*, u.first_name as uploader_first_name, u.last_name as uploader_last_name
       FROM documents d
       JOIN users u ON d.uploaded_by = u.id
       WHERE d.id = ? AND d.organization_id = ? AND d.deleted_at IS NULL`, [id, orgId]);
        if (!doc) {
            throw new common_1.NotFoundException({
                code: 'DOCUMENT_NOT_FOUND',
                message: 'Document not found',
            });
        }
        return {
            ...doc,
            is_signed: !!doc.is_signed,
            download_url: `/api/v1/documents/${doc.id}/download-url`,
        };
    }
    create(orgId, userId, data) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const storageKey = `organizations/${orgId}/documents/${id}-${data.name || 'document.pdf'}`;
        const checksum = crypto.createHash('sha256').update(`${id}-${now}`).digest('hex');
        this.db.run(`INSERT INTO documents (
        id, organization_id, location_id, customer_id, vehicle_id, work_order_id,
        uploaded_by, type, name, storage_key, mime_type, file_size, checksum,
        is_signed, content_html, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            orgId,
            data.location_id,
            data.customer_id,
            data.vehicle_id,
            data.work_order_id || null,
            userId,
            data.type || types_1.DocumentType.OTHER,
            data.name || 'Документ',
            storageKey,
            data.mime_type || 'application/pdf',
            Number(data.file_size) || 1024,
            checksum,
            data.is_signed ? 1 : 0,
            data.content_html || null,
            now,
            now,
        ]);
        this.ws.emitToOrganization(orgId, 'document.uploaded', { documentId: id, name: data.name });
        return this.getById(orgId, id);
    }
    generate(orgId, userId, data) {
        const vehicle = this.db.get('SELECT * FROM vehicles WHERE id = ?', [data.vehicle_id]);
        const customer = this.db.get('SELECT * FROM customers WHERE id = ?', [data.customer_id]);
        const org = this.db.get('SELECT * FROM organizations WHERE id = ?', [orgId]);
        const location = this.db.get('SELECT * FROM locations WHERE id = ?', [data.location_id]);
        let workOrder = null;
        let items = [];
        if (data.work_order_id) {
            workOrder = this.db.get('SELECT * FROM work_orders WHERE id = ?', [data.work_order_id]);
            items = this.db.all('SELECT * FROM work_order_items WHERE work_order_id = ?', [data.work_order_id]);
        }
        const docId = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const dateFormatted = new Date().toLocaleDateString('ru-RU');
        let title = 'Документ автосервиса';
        let docType = data.type || types_1.DocumentType.WORK_ORDER;
        if (docType === types_1.DocumentType.WORK_ORDER) {
            title = `Заказ-наряд #${workOrder?.number || 'Б/Н'} от ${dateFormatted}`;
        }
        else if (docType === types_1.DocumentType.ACCEPTANCE_ACT) {
            title = `Акт приема-передачи ТС к заказу #${workOrder?.number || 'Б/Н'} от ${dateFormatted}`;
        }
        else if (docType === types_1.DocumentType.COMPLETION_ACT) {
            title = `Акт выполненных работ к заказу #${workOrder?.number || 'Б/Н'} от ${dateFormatted}`;
        }
        else if (docType === types_1.DocumentType.INVOICE) {
            title = `Счет на оплату #${workOrder?.number || 'Б/Н'} от ${dateFormatted}`;
        }
        const docName = data.name || title;
        // Build rich printable HTML template for Russian automotive documents
        const htmlContent = `
      <div class="automotive-doc p-8 font-sans max-w-4xl mx-auto bg-white text-gray-900 border border-gray-200 rounded-lg shadow-sm">
        <div class="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold uppercase tracking-wide text-gray-900">${org?.name || 'СТО СЕРВИС'}</h1>
            <p class="text-xs text-gray-600">${location?.name || 'Филиал СТО'} • ${location?.address || 'Адрес автосервиса'}</p>
            <p class="text-xs text-gray-600">Тел: ${org?.phone || '+7 (999) 000-00-00'} | ИНН: ${org?.tax_id || '7701234567'}</p>
          </div>
          <div class="text-right">
            <span class="inline-block px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded uppercase">Официальный документ</span>
            <p class="text-sm font-semibold text-gray-700 mt-2">Дата: ${dateFormatted}</p>
          </div>
        </div>

        <h2 class="text-xl font-bold text-center uppercase tracking-wider my-4 text-gray-800">${title}</h2>

        <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-sm">
          <div>
            <h3 class="font-bold text-gray-700 uppercase text-xs mb-1">Заказчик (Клиент)</h3>
            <p class="font-semibold text-gray-900">${customer?.first_name || ''} ${customer?.last_name || ''}</p>
            <p class="text-gray-600">Телефон: ${customer?.phone || '—'}</p>
            <p class="text-gray-600">Email: ${customer?.email || '—'}</p>
          </div>
          <div>
            <h3 class="font-bold text-gray-700 uppercase text-xs mb-1">Автомобиль</h3>
            <p class="font-semibold text-gray-900">${vehicle?.make || ''} ${vehicle?.model || ''} (${vehicle?.year || ''} г.в.)</p>
            <p class="text-gray-600 font-mono">Госномер: <strong class="text-gray-900">${vehicle?.license_plate || '—'}</strong> | VIN: <strong class="text-gray-900">${vehicle?.vin || '—'}</strong></p>
            <p class="text-gray-600">Пробег при приеме: <strong class="text-gray-900">${workOrder?.mileage_in || vehicle?.mileage || 0} км</strong></p>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="font-bold text-gray-800 uppercase text-xs mb-2">Перечень выполненных работ и установленных запчастей</h3>
          <table class="w-full text-left text-sm border-collapse border border-gray-300">
            <thead>
              <tr class="bg-gray-100 text-gray-700 text-xs uppercase">
                <th class="border border-gray-300 p-2 w-12 text-center">№</th>
                <th class="border border-gray-300 p-2">Наименование</th>
                <th class="border border-gray-300 p-2 w-20 text-center">Тип</th>
                <th class="border border-gray-300 p-2 w-20 text-center">Кол-во</th>
                <th class="border border-gray-300 p-2 w-24 text-right">Цена (₽)</th>
                <th class="border border-gray-300 p-2 w-28 text-right">Сумма (₽)</th>
              </tr>
            </thead>
            <tbody>
              ${items.length > 0
            ? items
                .map((it, idx) => `
                <tr class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="border border-gray-300 p-2 text-center text-xs text-gray-500">${idx + 1}</td>
                  <td class="border border-gray-300 p-2 font-medium">${it.description}</td>
                  <td class="border border-gray-300 p-2 text-center text-xs uppercase text-gray-600">${it.type === 'labor' ? 'Работа' : it.type === 'part' ? 'Деталь' : 'Прочее'}</td>
                  <td class="border border-gray-300 p-2 text-center">${it.quantity}</td>
                  <td class="border border-gray-300 p-2 text-right">${it.unit_price.toLocaleString('ru-RU')}</td>
                  <td class="border border-gray-300 p-2 text-right font-semibold">${it.total_price.toLocaleString('ru-RU')} ₽</td>
                </tr>
              `)
                .join('')
            : `
                <tr>
                  <td colspan="6" class="border border-gray-300 p-4 text-center text-gray-500">Диагностические и регламентные работы</td>
                </tr>
              `}
            </tbody>
            <tfoot>
              <tr class="bg-gray-50 font-semibold">
                <td colspan="5" class="border border-gray-300 p-2 text-right text-gray-700">Итого работы и материалы:</td>
                <td class="border border-gray-300 p-2 text-right">${(workOrder?.subtotal || 0).toLocaleString('ru-RU')} ₽</td>
              </tr>
              ${workOrder?.discount > 0
            ? `
              <tr class="bg-gray-50 text-emerald-700">
                <td colspan="5" class="border border-gray-300 p-2 text-right font-medium">Скидка:</td>
                <td class="border border-gray-300 p-2 text-right font-medium">-${workOrder.discount.toLocaleString('ru-RU')} ₽</td>
              </tr>
              `
            : ''}
              <tr class="bg-gray-100 font-bold text-base">
                <td colspan="5" class="border border-gray-300 p-3 text-right uppercase text-gray-900">Всего к оплате:</td>
                <td class="border border-gray-300 p-3 text-right text-indigo-700 text-lg">${(workOrder?.total || 0).toLocaleString('ru-RU')} ₽</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="border-t border-gray-300 pt-6 mt-8 grid grid-cols-2 gap-8 text-xs text-gray-700">
          <div>
            <p class="font-bold mb-1">Исполнитель (Мастер-приемщик):</p>
            <div class="h-12 border-b border-gray-400 mb-1 flex items-end font-serif italic text-gray-500 pb-1">Подпись / М.П.</div>
            <p>${org?.name || 'Автосервис'}</p>
          </div>
          <div>
            <p class="font-bold mb-1">Заказчик (Владелец ТС):</p>
            <div class="h-12 border-b border-gray-400 mb-1 flex items-end font-serif italic text-gray-500 pb-1">Претензий к объему и качеству не имею</div>
            <p>${customer?.first_name || ''} ${customer?.last_name || ''}</p>
          </div>
        </div>
      </div>
    `;
        return this.create(orgId, userId, {
            location_id: data.location_id,
            customer_id: data.customer_id,
            vehicle_id: data.vehicle_id,
            work_order_id: data.work_order_id,
            type: docType,
            name: docName,
            content_html: htmlContent,
            file_size: htmlContent.length,
            mime_type: 'text/html',
            is_signed: true,
        });
    }
    delete(orgId, id) {
        this.getById(orgId, id);
        const now = new Date().toISOString();
        this.db.run('UPDATE documents SET deleted_at = ?, updated_at = ? WHERE id = ? AND organization_id = ?', [now, now, id, orgId]);
        return { success: true, message: 'Document deleted' };
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        websocket_gateway_1.AppWebSocketGateway])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map