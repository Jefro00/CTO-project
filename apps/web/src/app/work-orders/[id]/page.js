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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkOrderDetailPage;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
const auth_store_1 = require("../../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../../components/ui/Card");
const Button_1 = require("../../../components/ui/Button");
const Badge_1 = require("../../../components/ui/Badge");
const Modal_1 = require("../../../components/ui/Modal");
const Input_1 = require("../../../components/ui/Input");
const Select_1 = require("../../../components/ui/Select");
function WorkOrderDetailPage() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const workOrderId = params?.id;
    const { api, user, currentLocation } = (0, auth_store_1.useAuthStore)();
    const [workOrder, setWorkOrder] = (0, react_1.useState)(null);
    const [mechanics, setMechanics] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    // Add Item Modal
    const [isAddItemModalOpen, setIsAddItemModalOpen] = (0, react_1.useState)(false);
    const [newItem, setNewItem] = (0, react_1.useState)({
        type: 'labor',
        description: '',
        quantity: 1,
        unit_price: 1500,
        cost_price: 0,
        assigned_to: '',
    });
    const loadWorkOrder = async () => {
        setIsLoading(true);
        try {
            const [woRes, uRes] = await Promise.all([
                api.getWorkOrder(workOrderId),
                api.request('/users'),
            ]);
            setWorkOrder(woRes.data);
            const allUsers = uRes.data || [];
            setMechanics(allUsers.filter((u) => u.role_name === 'MECHANIC' || u.role?.name === 'MECHANIC'));
        }
        catch (err) {
            console.error('Error fetching work order:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        if (workOrderId)
            loadWorkOrder();
    }, [workOrderId]);
    const handleStatusChange = async (action) => {
        try {
            if (action === 'approve')
                await api.approveWorkOrder(workOrderId);
            if (action === 'start')
                await api.startWorkOrder(workOrderId);
            if (action === 'complete')
                await api.completeWorkOrder(workOrderId);
            if (action === 'close')
                await api.closeWorkOrder(workOrderId);
            loadWorkOrder();
        }
        catch (err) {
            alert(err.message || 'Ошибка изменения статуса');
        }
    };
    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await api.addWorkOrderItem(workOrderId, {
                ...newItem,
                quantity: Number(newItem.quantity),
                unit_price: Number(newItem.unit_price),
                cost_price: Number(newItem.cost_price) || null,
                assigned_to: newItem.assigned_to || null,
            });
            setIsAddItemModalOpen(false);
            setNewItem({
                type: 'labor',
                description: '',
                quantity: 1,
                unit_price: 1500,
                cost_price: 0,
                assigned_to: '',
            });
            loadWorkOrder();
        }
        catch (err) {
            alert(err.message || 'Ошибка добавления позиции');
        }
    };
    const handleDeleteItem = async (itemId) => {
        try {
            await api.request(`/work-orders/${workOrderId}/items/${itemId}`, { method: 'DELETE' });
            loadWorkOrder();
        }
        catch (err) {
            alert(err.message || 'Ошибка удаления');
        }
    };
    const handleGenerateDoc = async (type) => {
        if (!workOrder)
            return;
        try {
            await api.generateDocument({
                type,
                work_order_id: workOrder.id,
                vehicle_id: workOrder.vehicle_id,
                customer_id: workOrder.customer_id,
                location_id: workOrder.location_id,
            });
            alert('Документ успешно сформирован и сохранен!');
            router.push('/documents');
        }
        catch (err) {
            alert(err.message || 'Ошибка генерации документа');
        }
    };
    if (isLoading) {
        return <div className="text-center py-16 text-slate-500 text-sm">Загрузка заказ-наряда...</div>;
    }
    if (!workOrder) {
        return (<div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800">Заказ-наряд не найден</h2>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Top Bar with Status Transitions (Section 68) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <lucide_react_1.ArrowLeft className="w-4 h-4"/>
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Заказ-наряд #{workOrder.number}
              </h1>
              <Badge_1.Badge variant={workOrder.status === 'closed' ? 'emerald' : 'amber'} size="md">
                {workOrder.status}
              </Badge_1.Badge>
            </div>
            <p className="text-xs text-slate-500">
              Открыт: {new Date(workOrder.opened_at).toLocaleDateString('ru-RU')} • Мастер-приемщик: {workOrder.advisor?.first_name} {workOrder.advisor?.last_name}
            </p>
          </div>
        </div>

        {/* Workflow Lifecycle Action Buttons (Section 68: [Согласовать] [В работу] [Завершить]) */}
        <div className="flex flex-wrap items-center gap-2">
          {workOrder.status === 'waiting_approval' && (<Button_1.Button variant="primary" size="md" onClick={() => handleStatusChange('approve')} className="font-bold">
              <lucide_react_1.Check className="w-4 h-4 mr-1"/>
              <span>Согласовать заказ</span>
            </Button_1.Button>)}

          {workOrder.status === 'approved' && (<Button_1.Button variant="primary" size="md" onClick={() => handleStatusChange('start')} className="font-bold bg-sky-600 hover:bg-sky-700">
              <lucide_react_1.Play className="w-4 h-4 mr-1"/>
              <span>В работу (Передать в цех)</span>
            </Button_1.Button>)}

          {workOrder.status === 'in_progress' && (<Button_1.Button variant="success" size="md" onClick={() => handleStatusChange('complete')} className="font-bold">
              <lucide_react_1.CheckCircle2 className="w-4 h-4 mr-1"/>
              <span>Завершить работы</span>
            </Button_1.Button>)}

          {workOrder.status === 'completed' && (<Button_1.Button variant="secondary" size="md" onClick={() => handleStatusChange('close')} className="font-bold">
              <lucide_react_1.Sparkles className="w-4 h-4 mr-1 text-emerald-400"/>
              <span>Закрыть заказ и выдать авто</span>
            </Button_1.Button>)}

          {/* Print Action */}
          <Button_1.Button variant="outline" size="md" onClick={() => handleGenerateDoc('work_order')} className="font-semibold">
            <lucide_react_1.Printer className="w-4 h-4 text-slate-600"/>
            <span>Печать заказ-наряда</span>
          </Button_1.Button>
        </div>
      </div>

      {/* Customer & Vehicle Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle summary */}
        <Card_1.Card className="p-4 bg-slate-900 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <lucide_react_1.Car className="w-8 h-8 text-sky-400 shrink-0"/>
              <div>
                <h3 className="text-base font-bold text-white">
                  {workOrder.vehicle?.make} {workOrder.vehicle?.model}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Госномер: <strong className="text-white">{workOrder.vehicle?.license_plate}</strong> • VIN: {workOrder.vehicle?.vin}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Пробег при приеме: <strong className="text-sky-400">{workOrder.mileage_in.toLocaleString('ru-RU')} км</strong>
                </p>
              </div>
            </div>
            <link_1.default href={`/vehicles/${workOrder.vehicle_id}`}>
              <Button_1.Button size="sm" variant="ghost" className="text-sky-400 hover:bg-slate-800 text-xs">
                История авто →
              </Button_1.Button>
            </link_1.default>
          </div>
        </Card_1.Card>

        {/* Customer summary */}
        <Card_1.Card className="p-4 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                <lucide_react_1.User className="w-5 h-5"/>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {workOrder.customer?.first_name} {workOrder.customer?.last_name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{workOrder.customer?.phone}</p>
                <p className="text-xs text-slate-400 mt-0.5">{workOrder.customer?.email || 'Email не указан'}</p>
              </div>
            </div>
            <link_1.default href={`/customers/${workOrder.customer_id}`}>
              <Button_1.Button size="sm" variant="ghost" className="text-indigo-600 hover:bg-indigo-50 text-xs">
                Карточка клиента →
              </Button_1.Button>
            </link_1.default>
          </div>
        </Card_1.Card>
      </div>

      {/* Complaints and Diagnostics */}
      <Card_1.Card title="Жалобы заказчика и результаты диагностики">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Жалоба клиента:</span>
            <p className="text-slate-800 text-sm mt-1 font-medium">{workOrder.customer_complaint || 'Плановое техническое обслуживание'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Диагноз мастера:</span>
            <p className="text-slate-800 text-sm mt-1 font-medium">{workOrder.diagnosis || 'Требуется замена масла ДВС и фильтров по регламенту'}</p>
          </div>
        </div>
      </Card_1.Card>

      {/* Section 68: Work Order Items Table (Работы & Запчасти) */}
      <Card_1.Card title="Работы и запасные части" action={<Button_1.Button variant="primary" size="sm" onClick={() => setIsAddItemModalOpen(true)}>
            <lucide_react_1.Plus className="w-4 h-4"/>
            <span>Добавить работу / деталь</span>
          </Button_1.Button>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase bg-slate-50">
                <th className="p-3 w-12 text-center">№</th>
                <th className="p-3">Наименование</th>
                <th className="p-3 w-28 text-center">Тип</th>
                <th className="p-3 w-24 text-center">Кол-во</th>
                <th className="p-3 w-32 text-right">Цена</th>
                <th className="p-3 w-36 text-right">Сумма</th>
                <th className="p-3 w-32 text-center">Статус</th>
                <th className="p-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workOrder.items && workOrder.items.length > 0 ? (workOrder.items.map((item, idx) => (<tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-xs text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{item.description}</p>
                      {item.assignee && (<p className="text-xs text-slate-400">
                          Мастер: {item.assignee.first_name} {item.assignee.last_name}
                        </p>)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-700">
                        {item.type === 'labor' ? 'Работа' : item.type === 'part' ? 'Деталь' : 'Прочее'}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono">{item.quantity}</td>
                    <td className="p-3 text-right font-mono text-slate-700">{item.unit_price.toLocaleString('ru-RU')} ₽</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{item.total_price.toLocaleString('ru-RU')} ₽</td>
                    <td className="p-3 text-center">
                      <Badge_1.Badge variant={item.status === 'completed' ? 'emerald' : 'amber'} size="sm">
                        {item.status}
                      </Badge_1.Badge>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDeleteItem(item.id)} className="text-slate-400 hover:text-rose-600 p-1">
                        <lucide_react_1.Trash2 className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>))) : (<tr>
                  <td colSpan={8} className="p-6 text-center text-xs text-slate-400">
                    В заказе еще нет позиций. Нажмите &quot;Добавить работу / деталь&quot;
                  </td>
                </tr>)}
            </tbody>
            {/* Financial Summary */}
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 text-sm font-semibold">
                <td colSpan={5} className="p-3 text-right text-slate-600">Подытог:</td>
                <td className="p-3 text-right font-mono">{workOrder.subtotal.toLocaleString('ru-RU')} ₽</td>
                <td colSpan={2}></td>
              </tr>
              {workOrder.discount > 0 && (<tr className="bg-emerald-50/50 text-emerald-800 text-sm font-semibold">
                  <td colSpan={5} className="p-3 text-right">Скидка:</td>
                  <td className="p-3 text-right font-mono">-{workOrder.discount.toLocaleString('ru-RU')} ₽</td>
                  <td colSpan={2}></td>
                </tr>)}
              <tr className="bg-slate-900 text-white font-bold text-base">
                <td colSpan={5} className="p-4 text-right uppercase tracking-wider text-xs">Итого к оплате (Section 68):</td>
                <td className="p-4 text-right font-mono text-xl text-sky-400">{workOrder.total.toLocaleString('ru-RU')} ₽</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card_1.Card>

      {/* Quick Acts & Document Generation */}
      <Card_1.Card title="Официальные документы по данному заказу">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Button_1.Button variant="outline" size="sm" onClick={() => handleGenerateDoc('work_order')}>
            <lucide_react_1.FileText className="w-4 h-4 text-indigo-600 mr-1"/>
            Заказ-наряд (Акт)
          </Button_1.Button>
          <Button_1.Button variant="outline" size="sm" onClick={() => handleGenerateDoc('acceptance_act')}>
            <lucide_react_1.FileText className="w-4 h-4 text-sky-600 mr-1"/>
            Акт приема-передачи ТС
          </Button_1.Button>
          <Button_1.Button variant="outline" size="sm" onClick={() => handleGenerateDoc('completion_act')}>
            <lucide_react_1.FileText className="w-4 h-4 text-emerald-600 mr-1"/>
            Акт выполненных работ
          </Button_1.Button>
          <Button_1.Button variant="outline" size="sm" onClick={() => handleGenerateDoc('invoice')}>
            <lucide_react_1.FileText className="w-4 h-4 text-amber-600 mr-1"/>
            Счет на оплату
          </Button_1.Button>
        </div>
      </Card_1.Card>

      {/* Add Item Modal */}
      <Modal_1.Modal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} title="Добавление работы или запчасти в заказ">
        <form onSubmit={handleAddItem} className="space-y-4">
          <Select_1.Select label="Тип позиции" value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })} options={[
            { value: 'labor', label: 'Сервисная работа / услуга' },
            { value: 'part', label: 'Запасная часть / материал' },
            { value: 'other', label: 'Прочие услуги (диагностика, мойка)' },
        ]}/>

          <Input_1.Input label="Наименование работы или запчасти" placeholder="например: Замена тормозных колодок" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} required/>

          <div className="grid grid-cols-2 gap-3">
            <Input_1.Input label="Количество" type="number" step="any" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })} required/>
            <Input_1.Input label="Цена за единицу (₽)" type="number" value={newItem.unit_price} onChange={(e) => setNewItem({ ...newItem, unit_price: Number(e.target.value) })} required/>
          </div>

          <Select_1.Select label="Назначенный механик" value={newItem.assigned_to} onChange={(e) => setNewItem({ ...newItem, assigned_to: e.target.value })} options={[
            { value: '', label: 'Не назначен' },
            ...mechanics.map((m) => ({
                value: m.id,
                label: `${m.first_name} ${m.last_name}`,
            })),
        ]}/>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button_1.Button variant="ghost" type="button" onClick={() => setIsAddItemModalOpen(false)}>
              Отмена
            </Button_1.Button>
            <Button_1.Button variant="primary" type="submit">
              Добавить в заказ
            </Button_1.Button>
          </div>
        </form>
      </Modal_1.Modal>
    </div>);
}
//# sourceMappingURL=page.js.map