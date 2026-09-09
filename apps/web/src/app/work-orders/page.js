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
exports.default = WorkOrdersPage;
const react_1 = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const auth_store_1 = require("../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../components/ui/Card");
const Button_1 = require("../../components/ui/Button");
const Badge_1 = require("../../components/ui/Badge");
const Modal_1 = require("../../components/ui/Modal");
const Input_1 = require("../../components/ui/Input");
const Select_1 = require("../../components/ui/Select");
function WorkOrdersPage() {
    const router = (0, navigation_1.useRouter)();
    const { api, currentLocation, locations } = (0, auth_store_1.useAuthStore)();
    const [workOrders, setWorkOrders] = (0, react_1.useState)([]);
    const [customers, setCustomers] = (0, react_1.useState)([]);
    const [vehicles, setVehicles] = (0, react_1.useState)([]);
    const [users, setUsers] = (0, react_1.useState)([]);
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [search, setSearch] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    // Quick Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = (0, react_1.useState)(false);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [newOrder, setNewOrder] = (0, react_1.useState)({
        customer_id: '',
        vehicle_id: '',
        location_id: '',
        master_id: '',
        mileage_in: 0,
        customer_complaint: '',
        diagnosis: '',
        items: [
            { type: 'labor', description: 'Диагностика и осмотр ходовой части', quantity: 1, unit_price: 1500 },
        ],
    });
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [woRes, cRes, vRes, uRes] = await Promise.all([
                api.getWorkOrders({
                    status: statusFilter === 'all' ? undefined : statusFilter,
                    search,
                }),
                api.getCustomers({ limit: 100 }),
                api.getVehicles({ limit: 100 }),
                api.request('/users').catch(() => ({ data: [] })),
            ]);
            setWorkOrders(woRes.data || []);
            setCustomers(cRes.data || []);
            setVehicles(vRes.data || []);
            setUsers(uRes.data || []);
            if (cRes.data && cRes.data.length > 0 && !newOrder.customer_id) {
                const firstCust = cRes.data[0];
                const relVeh = vRes.data?.find((v) => v.customer_id === firstCust.id) || vRes.data?.[0];
                setNewOrder((prev) => ({
                    ...prev,
                    customer_id: firstCust.id,
                    vehicle_id: relVeh?.id || '',
                    mileage_in: relVeh?.mileage || 100000,
                    location_id: currentLocation?.id || locations[0]?.id || '',
                }));
            }
        }
        catch (err) {
            console.error('Error loading data:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(loadData, 150);
        return () => clearTimeout(timer);
    }, [statusFilter, search]);
    const handleCustomerChange = (custId) => {
        const relVeh = vehicles.find((v) => v.customer_id === custId);
        setNewOrder((prev) => ({
            ...prev,
            customer_id: custId,
            vehicle_id: relVeh ? relVeh.id : prev.vehicle_id,
            mileage_in: relVeh ? relVeh.mileage : prev.mileage_in,
        }));
    };
    const handleVehicleChange = (vehId) => {
        const veh = vehicles.find((v) => v.id === vehId);
        if (veh) {
            setNewOrder((prev) => ({
                ...prev,
                vehicle_id: vehId,
                customer_id: veh.customer_id,
                mileage_in: veh.mileage,
            }));
        }
    };
    const handleAddItemRow = () => {
        setNewOrder((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                { type: 'labor', description: '', quantity: 1, unit_price: 0 },
            ],
        }));
    };
    const handleRemoveItemRow = (index) => {
        setNewOrder((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };
    const handleItemChange = (index, field, value) => {
        setNewOrder((prev) => {
            const nextItems = [...prev.items];
            nextItems[index] = { ...nextItems[index], [field]: value };
            return { ...prev, items: nextItems };
        });
    };
    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!newOrder.customer_id || !newOrder.vehicle_id) {
            alert('Пожалуйста, выберите клиента и автомобиль');
            return;
        }
        setIsSubmitting(true);
        try {
            const targetLocId = newOrder.location_id || currentLocation?.id || (locations.length > 0 ? locations[0].id : null);
            const res = await api.createWorkOrder({
                location_id: targetLocId,
                customer_id: newOrder.customer_id,
                vehicle_id: newOrder.vehicle_id,
                master_id: newOrder.master_id || null,
                mileage_in: Number(newOrder.mileage_in) || 0,
                customer_complaint: newOrder.customer_complaint || 'Техническое обслуживание',
                diagnosis: newOrder.diagnosis || null,
                status: 'draft',
                items: newOrder.items.filter((i) => i.description.trim().length > 0),
            });
            setIsCreateModalOpen(false);
            router.push(`/work-orders/${res.data.id}`);
        }
        catch (err) {
            alert(err.message || 'Ошибка создания заказ-наряда');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const statuses = [
        { id: 'all', label: 'Все заказы' },
        { id: 'draft', label: 'Черновик' },
        { id: 'in_progress', label: 'В работе' },
        { id: 'waiting_approval', label: 'Согласование' },
        { id: 'approved', label: 'Согласован' },
        { id: 'completed', label: 'Завершен' },
        { id: 'closed', label: 'Закрыт' },
    ];
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <lucide_react_1.Wrench className="w-7 h-7 text-indigo-600"/> Заказ-наряды
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Управление сервисными работами, запчастями, назначением механиков и актами
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button_1.Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20" onClick={() => setIsCreateModalOpen(true)}>
            <lucide_react_1.Plus className="w-4 h-4"/>
            <span>Создать заказ-наряд</span>
          </Button_1.Button>
          <link_1.default href="/inspections/new">
            <Button_1.Button variant="outline" size="md" className="font-bold">
              <lucide_react_1.ClipboardCheck className="w-4 h-4 text-indigo-600"/>
              <span>Приемка + заказ</span>
            </Button_1.Button>
          </link_1.default>
        </div>
      </div>

      {/* Filter and Status tabs */}
      <Card_1.Card className="p-3 space-y-3">
        <div className="relative">
          <lucide_react_1.Search className="w-4 h-4 text-slate-400 absolute left-3 top-3"/>
          <input type="text" placeholder="Поиск по номеру заказа #, марке, модели, госномеру или клиенту..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>

        {/* Status Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statuses.map((st) => (<button key={st.id} onClick={() => setStatusFilter(st.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${statusFilter === st.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {st.label}
            </button>))}
        </div>
      </Card_1.Card>

      {/* Orders List */}
      {isLoading ? (<div className="text-center py-12 text-slate-500 text-sm">Загрузка заказ-нарядов...</div>) : workOrders.length === 0 ? (<Card_1.Card className="text-center py-16">
          <lucide_react_1.Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
          <h3 className="text-base font-bold text-slate-800">Заказ-наряды не найдены</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Создайте первый заказ-наряд прямо сейчас или оформите его через мастер приемки автомобиля
          </p>
          <div className="flex justify-center gap-3">
            <Button_1.Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <lucide_react_1.Plus className="w-4 h-4"/> Быстрый заказ-наряд
            </Button_1.Button>
            <link_1.default href="/inspections/new">
              <Button_1.Button variant="outline" size="sm">
                <lucide_react_1.ClipboardCheck className="w-4 h-4 text-indigo-600"/> Оформить приемку ТС
              </Button_1.Button>
            </link_1.default>
          </div>
        </Card_1.Card>) : (<div className="space-y-3">
          {workOrders.map((wo) => {
                const badgeVariants = {
                    draft: 'gray',
                    waiting_approval: 'amber',
                    approved: 'indigo',
                    in_progress: 'sky',
                    completed: 'emerald',
                    closed: 'gray',
                };
                return (<link_1.default key={wo.id} href={`/work-orders/${wo.id}`} className="block bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-base font-black px-3 py-1.5 bg-slate-900 text-white rounded-xl shrink-0 group-hover:bg-indigo-600 transition-colors shadow-xs">
                      #{wo.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {wo.vehicle?.make} {wo.vehicle?.model}
                        </h3>
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {wo.vehicle?.license_plate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Владелец: {wo.customer?.first_name} {wo.customer?.last_name} ({wo.customer?.phone}) • Приемщик: {wo.advisor?.first_name} {wo.advisor?.last_name}
                      </p>
                      {wo.customer_complaint && (<p className="text-xs text-slate-600 mt-1 font-medium line-clamp-1">
                          Жалоба: {wo.customer_complaint}
                        </p>)}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0">
                    <div className="text-right mb-2">
                      <span className="text-base font-black text-slate-900 font-mono">
                        {wo.total.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {wo.items?.length || 0} поз. (работ и деталей)
                      </span>
                    </div>
                    <Badge_1.Badge variant={badgeVariants[wo.status] || 'gray'} size="sm">
                      {wo.status}
                    </Badge_1.Badge>
                  </div>
                </div>
              </link_1.default>);
            })}
        </div>)}

      {/* Direct Work Order Creation Modal */}
      <Modal_1.Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Создание нового заказ-наряда" size="lg">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select_1.Select label="Клиент" value={newOrder.customer_id} onChange={(e) => handleCustomerChange(e.target.value)} options={customers.map((c) => ({
            value: c.id,
            label: `${c.first_name} ${c.last_name} (${c.phone})`,
        }))} required/>

            <Select_1.Select label="Автомобиль" value={newOrder.vehicle_id} onChange={(e) => handleVehicleChange(e.target.value)} options={vehicles.map((v) => ({
            value: v.id,
            label: `${v.make} ${v.model} [${v.license_plate}]`,
        }))} required/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input_1.Input label="Пробег при сдаче (км)" type="number" value={newOrder.mileage_in} onChange={(e) => setNewOrder({ ...newOrder, mileage_in: Number(e.target.value) })} required/>

            <Select_1.Select label="Филиал СТО" value={newOrder.location_id} onChange={(e) => setNewOrder({ ...newOrder, location_id: e.target.value })} options={locations.map((l) => ({
            value: l.id,
            label: l.name,
        }))}/>

            <Select_1.Select label="Назначить мастера" value={newOrder.master_id} onChange={(e) => setNewOrder({ ...newOrder, master_id: e.target.value })} options={[
            { value: '', label: 'Не назначен' },
            ...users
                .filter((u) => u.role_name === 'MECHANIC' || u.role_name === 'MASTER')
                .map((m) => ({
                value: m.id,
                label: `${m.first_name} ${m.last_name} (${m.role_name})`,
            })),
        ]}/>
          </div>

          <Input_1.Input label="Причина обращения / Жалоба клиента" placeholder="например: Шум в передней подвеске при проезде неровностей" value={newOrder.customer_complaint} onChange={(e) => setNewOrder({ ...newOrder, customer_complaint: e.target.value })} required/>

          {/* Initial items */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Первичные работы и запчасти
              </label>
              <Button_1.Button type="button" variant="outline" size="sm" onClick={handleAddItemRow}>
                <lucide_react_1.PlusCircle className="w-3.5 h-3.5 mr-1"/> Добавить строку
              </Button_1.Button>
            </div>

            <div className="space-y-2">
              {newOrder.items.map((item, idx) => (<div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <select value={item.type} onChange={(e) => handleItemChange(idx, 'type', e.target.value)} className="p-1.5 bg-white border border-slate-200 rounded text-xs font-semibold">
                    <option value="labor">Работа</option>
                    <option value="part">Запчасть</option>
                  </select>

                  <input type="text" placeholder="Наименование работы или запчасти" value={item.description} onChange={(e) => handleItemChange(idx, 'description', e.target.value)} className="flex-1 p-1.5 bg-white border border-slate-200 rounded text-xs" required/>

                  <div className="w-16">
                    <input type="number" min="1" placeholder="Кол-во" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))} className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-center"/>
                  </div>

                  <div className="w-24">
                    <input type="number" placeholder="Цена ₽" value={item.unit_price} onChange={(e) => handleItemChange(idx, 'unit_price', Number(e.target.value))} className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-mono text-right"/>
                  </div>

                  {newOrder.items.length > 1 && (<button type="button" onClick={() => handleRemoveItemRow(idx)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded">
                      <lucide_react_1.Trash2 className="w-4 h-4"/>
                    </button>)}
                </div>))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button_1.Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Отмена
            </Button_1.Button>
            <Button_1.Button variant="primary" type="submit" isLoading={isSubmitting}>
              Создать и открыть заказ-наряд
            </Button_1.Button>
          </div>
        </form>
      </Modal_1.Modal>
    </div>);
}
//# sourceMappingURL=page.js.map