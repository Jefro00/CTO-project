"use strict";
'use client';
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DocumentsPage;
const react_1 = __importStar(require("react"));
const auth_store_1 = require("../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../components/ui/Card");
const Button_1 = require("../../components/ui/Button");
const Badge_1 = require("../../components/ui/Badge");
const Modal_1 = require("../../components/ui/Modal");
const types_1 = require("@automotive-os/types");
function DocumentsPage() {
    const { api, user, currentLocation } = (0, auth_store_1.useAuthStore)();
    const [documents, setDocuments] = (0, react_1.useState)([]);
    const [workOrders, setWorkOrders] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    // Selected document for preview / printing
    const [selectedDoc, setSelectedDoc] = (0, react_1.useState)(null);
    // Generate modal
    const [isGenerateModalOpen, setIsGenerateModalOpen] = (0, react_1.useState)(false);
    const [selectedWoId, setSelectedWoId] = (0, react_1.useState)('');
    const [docType, setDocType] = (0, react_1.useState)(types_1.DocumentType.WORK_ORDER);
    const loadDocs = async () => {
        setIsLoading(true);
        try {
            const [dRes, woRes] = await Promise.all([
                api.getDocuments(),
                api.getWorkOrders({ limit: 50 }),
            ]);
            setDocuments(dRes.data || []);
            setWorkOrders(woRes.data || []);
            if (woRes.data && woRes.data.length > 0 && !selectedWoId) {
                setSelectedWoId(woRes.data[0].id);
            }
        }
        catch (err) {
            console.error('Error fetching documents:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadDocs();
    }, []);
    const handleGenerate = async (e) => {
        e.preventDefault();
        const wo = workOrders.find((w) => w.id === selectedWoId);
        if (!wo) {
            alert('Выберите заказ-наряд');
            return;
        }
        try {
            const doc = await api.generateDocument({
                type: docType,
                work_order_id: wo.id,
                vehicle_id: wo.vehicle_id,
                customer_id: wo.customer_id,
                location_id: wo.location_id || currentLocation?.id || '',
            });
            setIsGenerateModalOpen(false);
            setSelectedDoc(doc.data);
            loadDocs();
        }
        catch (err) {
            alert(err.message || 'Ошибка генерации документа');
        }
    };
    const handlePrint = () => {
        window.print();
    };
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <lucide_react_1.FileText className="w-7 h-7 text-indigo-600"/> Документы и акты автосервиса
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Формирование заказ-нарядов, актов приема-передачи, выполненных работ и счетов (Section 46 & 21)
          </p>
        </div>
        <Button_1.Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20" onClick={() => setIsGenerateModalOpen(true)}>
          <lucide_react_1.Plus className="w-4 h-4"/>
          <span>Сформировать документ</span>
        </Button_1.Button>
      </div>

      {isLoading ? (<div className="text-center py-12 text-slate-500 text-sm">Загрузка документов...</div>) : documents.length === 0 ? (<Card_1.Card className="text-center py-16">
          <lucide_react_1.FileText className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
          <h3 className="text-base font-bold text-slate-800">Документы не сформированы</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Сформируйте официальный заказ-наряд или акт выполненных работ к любому заказу
          </p>
          <Button_1.Button variant="primary" size="sm" onClick={() => setIsGenerateModalOpen(true)}>
            <lucide_react_1.Plus className="w-4 h-4"/> Создать первый акт
          </Button_1.Button>
        </Card_1.Card>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
                const typeLabels = {
                    work_order: 'Заказ-наряд',
                    acceptance_act: 'Акт приема-передачи',
                    completion_act: 'Акт выполненных работ',
                    invoice: 'Счет на оплату',
                    contract: 'Договор',
                };
                return (<Card_1.Card key={doc.id} className="hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      <lucide_react_1.FileText className="w-5 h-5"/>
                    </div>
                    <Badge_1.Badge variant={doc.is_signed ? 'emerald' : 'gray'} size="sm">
                      {doc.is_signed ? 'Подписан' : 'Черновик'}
                    </Badge_1.Badge>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{doc.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Тип: <span className="font-semibold text-slate-700">{typeLabels[doc.type] || doc.type}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Создан: {new Date(doc.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Button_1.Button variant="outline" size="sm" className="w-full text-xs font-semibold" onClick={() => setSelectedDoc(doc)}>
                    <lucide_react_1.Eye className="w-3.5 h-3.5 mr-1"/>
                    Просмотр и печать
                  </Button_1.Button>
                </div>
              </Card_1.Card>);
            })}
        </div>)}

      {/* Generate Document Modal */}
      <Modal_1.Modal isOpen={isGenerateModalOpen} onClose={() => setIsGenerateModalOpen(false)} title="Формирование официального документа">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
              Тип документа
            </label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full text-sm p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="work_order">Заказ-наряд (Акт приема с калькуляцией)</option>
              <option value="acceptance_act">Акт приема-передачи автомобиля</option>
              <option value="completion_act">Акт выполненных работ и услуг</option>
              <option value="invoice">Счет на оплату</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1.5">
              Привязать к заказ-наряду
            </label>
            <select value={selectedWoId} onChange={(e) => setSelectedWoId(e.target.value)} className="w-full text-sm p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" required>
              {workOrders.map((w) => (<option key={w.id} value={w.id}>
                  Заказ-наряд #{w.number} — {w.vehicle?.make} {w.vehicle?.model} ({w.total} ₽)
                </option>))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button_1.Button variant="ghost" type="button" onClick={() => setIsGenerateModalOpen(false)}>
              Отмена
            </Button_1.Button>
            <Button_1.Button variant="primary" type="submit">
              Сформировать
            </Button_1.Button>
          </div>
        </form>
      </Modal_1.Modal>

      {/* Document Printable View Modal */}
      <Modal_1.Modal isOpen={!!selectedDoc} onClose={() => setSelectedDoc(null)} title={selectedDoc?.name || 'Просмотр документа'} maxWidth="4xl">
        {selectedDoc && (<div className="space-y-4">
            <div className="flex justify-end gap-2 no-print">
              <Button_1.Button variant="primary" size="sm" onClick={handlePrint}>
                <lucide_react_1.Printer className="w-4 h-4 mr-1"/>
                Распечатать документ
              </Button_1.Button>
            </div>

            {/* Document Render Canvas */}
            <div className="printable-document border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
              {selectedDoc.content_html ? (<div dangerouslySetInnerHTML={{ __html: selectedDoc.content_html }}/>) : (<div className="p-8 text-center text-xs text-slate-500">
                  Содержимое документа в формате PDF
                </div>)}
            </div>
          </div>)}
      </Modal_1.Modal>
    </div>);
}
//# sourceMappingURL=page.js.map