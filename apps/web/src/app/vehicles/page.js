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
exports.default = VehiclesPage;
const react_1 = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
const auth_store_1 = require("../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../components/ui/Card");
const Button_1 = require("../../components/ui/Button");
const Modal_1 = require("../../components/ui/Modal");
const Input_1 = require("../../components/ui/Input");
const Select_1 = require("../../components/ui/Select");
function VehiclesPage() {
    const { api } = (0, auth_store_1.useAuthStore)();
    const [vehicles, setVehicles] = (0, react_1.useState)([]);
    const [customers, setCustomers] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [search, setSearch] = (0, react_1.useState)('');
    const [isCreateModalOpen, setIsCreateModalOpen] = (0, react_1.useState)(false);
    // New vehicle form
    const [newVeh, setNewVeh] = (0, react_1.useState)({
        customer_id: '',
        make: '',
        model: '',
        generation: '',
        year: new Date().getFullYear(),
        color: '',
        vin: '',
        license_plate: '',
        mileage: 0,
        engine: '',
        transmission: 'АКПП',
        drive_type: 'Полный',
        fuel_type: 'Бензин',
        notes: '',
    });
    const loadVehicles = async () => {
        setIsLoading(true);
        try {
            const [vRes, cRes] = await Promise.all([
                api.getVehicles({ search }),
                api.getCustomers({ limit: 100 }),
            ]);
            setVehicles(vRes.data || []);
            setCustomers(cRes.data || []);
            if (cRes.data && cRes.data.length > 0 && !newVeh.customer_id) {
                setNewVeh((prev) => ({ ...prev, customer_id: cRes.data[0].id }));
            }
        }
        catch (err) {
            console.error('Error fetching vehicles:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(loadVehicles, 200);
        return () => clearTimeout(timer);
    }, [search]);
    const handleCreateVehicle = async (e) => {
        e.preventDefault();
        try {
            await api.createVehicle(newVeh);
            setIsCreateModalOpen(false);
            loadVehicles();
        }
        catch (err) {
            alert(err.message || 'Ошибка создания автомобиля');
        }
    };
    return (<div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <lucide_react_1.Car className="w-7 h-7 text-indigo-600"/> База автомобилей
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Реестр транспортных средств с полной цифровой историей обслуживания
          </p>
        </div>
        <Button_1.Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20" onClick={() => setIsCreateModalOpen(true)}>
          <lucide_react_1.Plus className="w-4 h-4"/>
          <span>Добавить автомобиль</span>
        </Button_1.Button>
      </div>

      {/* Filter / Search Bar */}
      <Card_1.Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <lucide_react_1.Search className="w-4 h-4 text-slate-400 absolute left-3 top-3"/>
            <input type="text" placeholder="Поиск по марке, модели, VIN, госномеру или имени владельца..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>
        </div>
      </Card_1.Card>

      {/* Vehicles Grid / Table */}
      {isLoading ? (<div className="text-center py-12 text-slate-500 text-sm">Загрузка автомобилей...</div>) : vehicles.length === 0 ? (<Card_1.Card className="text-center py-16">
          <lucide_react_1.Car className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
          <h3 className="text-base font-bold text-slate-800">Автомобили не найдены</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            В базе пока нет автомобилей или запрос поиска не дал результатов
          </p>
          <Button_1.Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <lucide_react_1.Plus className="w-4 h-4"/> Добавить первый автомобиль
          </Button_1.Button>
        </Card_1.Card>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (<link_1.default key={v.id} href={`/vehicles/${v.id}`} className="block group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {v.make} {v.model}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {v.year} г.в. • {v.color || 'Цвет не указан'}
                  </p>
                </div>
                <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                  {v.license_plate}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">VIN:</span>
                  <span className="font-mono font-semibold text-slate-800">{v.vin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Владелец:</span>
                  <span className="font-semibold text-slate-800">
                    {v.customer?.first_name} {v.customer?.last_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Текущий пробег:</span>
                  <span className="font-bold text-indigo-600 font-mono">
                    {v.mileage.toLocaleString('ru-RU')} км
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Открыть историю авто</span>
                <lucide_react_1.ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
              </div>
            </link_1.default>))}
        </div>)}

      {/* Create Vehicle Modal */}
      <Modal_1.Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Регистрация нового автомобиля" maxWidth="2xl">
        <form onSubmit={handleCreateVehicle} className="space-y-4">
          <Select_1.Select label="Владелец (Клиент)" value={newVeh.customer_id} onChange={(e) => setNewVeh({ ...newVeh, customer_id: e.target.value })} options={customers.map((c) => ({
            value: c.id,
            label: `${c.first_name} ${c.last_name} (${c.phone})`,
        }))} required/>

          <div className="grid grid-cols-2 gap-3">
            <Input_1.Input label="Марка" placeholder="например: BMW" value={newVeh.make} onChange={(e) => setNewVeh({ ...newVeh, make: e.target.value })} required/>
            <Input_1.Input label="Модель" placeholder="например: X5" value={newVeh.model} onChange={(e) => setNewVeh({ ...newVeh, model: e.target.value })} required/>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input_1.Input label="Госномер" placeholder="A123AA77" value={newVeh.license_plate} onChange={(e) => setNewVeh({ ...newVeh, license_plate: e.target.value })} required/>
            <Input_1.Input label="VIN код" placeholder="WBA..." value={newVeh.vin} onChange={(e) => setNewVeh({ ...newVeh, vin: e.target.value })} required/>
            <Input_1.Input label="Год выпуска" type="number" value={newVeh.year} onChange={(e) => setNewVeh({ ...newVeh, year: Number(e.target.value) })} required/>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input_1.Input label="Текущий пробег (км)" type="number" value={newVeh.mileage} onChange={(e) => setNewVeh({ ...newVeh, mileage: Number(e.target.value) })} required/>
            <Input_1.Input label="Цвет кузова" placeholder="Черный металлик" value={newVeh.color} onChange={(e) => setNewVeh({ ...newVeh, color: e.target.value })}/>
            <Input_1.Input label="Двигатель / Мощность" placeholder="3.0 л / 249 л.с." value={newVeh.engine} onChange={(e) => setNewVeh({ ...newVeh, engine: e.target.value })}/>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button_1.Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Отмена
            </Button_1.Button>
            <Button_1.Button variant="primary" type="submit">
              Сохранить автомобиль
            </Button_1.Button>
          </div>
        </form>
      </Modal_1.Modal>
    </div>);
}
//# sourceMappingURL=page.js.map