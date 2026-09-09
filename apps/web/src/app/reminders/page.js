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
exports.default = RemindersPage;
const react_1 = __importStar(require("react"));
const auth_store_1 = require("../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../components/ui/Card");
const Button_1 = require("../../components/ui/Button");
const Badge_1 = require("../../components/ui/Badge");
const Modal_1 = require("../../components/ui/Modal");
const Input_1 = require("../../components/ui/Input");
const Select_1 = require("../../components/ui/Select");
function RemindersPage() {
    const { api, currentLocation } = (0, auth_store_1.useAuthStore)();
    const [reminders, setReminders] = (0, react_1.useState)([]);
    const [vehicles, setVehicles] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [newRem, setNewRem] = (0, react_1.useState)({
        vehicle_id: '',
        title: '',
        description: '',
        target_mileage: 152300,
        target_date: '',
        type: 'mileage',
    });
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [rRes, vRes] = await Promise.all([
                api.getReminders(),
                api.getVehicles({ limit: 100 }),
            ]);
            setReminders(rRes.data || []);
            setVehicles(vRes.data || []);
            if (vRes.data && vRes.data.length > 0 && !newRem.vehicle_id) {
                setNewRem((prev) => ({ ...prev, vehicle_id: vRes.data[0].id }));
            }
        }
        catch (err) {
            console.error('Error fetching reminders:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    const handleCreate = async (e) => {
        e.preventDefault();
        const veh = vehicles.find((v) => v.id === newRem.vehicle_id);
        if (!veh)
            return;
        try {
            await api.createReminder({
                ...newRem,
                customer_id: veh.customer_id,
                location_id: currentLocation?.id,
                target_mileage: Number(newRem.target_mileage) || null,
                target_date: newRem.target_date || null,
            });
            setIsModalOpen(false);
            loadData();
        }
        catch (err) {
            alert(err.message || 'Ошибка создания напоминания');
        }
    };
    const handleComplete = async (id) => {
        try {
            await api.completeReminder(id);
            loadData();
        }
        catch (err) {
            alert(err.message || 'Ошибка');
        }
    };
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <lucide_react_1.BellRing className="w-7 h-7 text-indigo-600"/> Напоминания о ТО
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Контроль сервисных интервалов по пробегу и датам (Section 48 & 24)
          </p>
        </div>
        <Button_1.Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20" onClick={() => setIsModalOpen(true)}>
          <lucide_react_1.Plus className="w-4 h-4"/>
          <span>Создать напоминание</span>
        </Button_1.Button>
      </div>

      {isLoading ? (<div className="text-center py-12 text-slate-500 text-sm">Загрузка напоминаний...</div>) : reminders.length === 0 ? (<Card_1.Card className="text-center py-16">
          <lucide_react_1.BellRing className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
          <h3 className="text-base font-bold text-slate-800">Напоминаний пока нет</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Добавьте напоминание о плановом ТО, замене тормозных колодок или сезонном шиномонтаже
          </p>
          <Button_1.Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <lucide_react_1.Plus className="w-4 h-4"/> Добавить напоминание
          </Button_1.Button>
        </Card_1.Card>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((rem) => (<Card_1.Card key={rem.id} className="hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <lucide_react_1.BellRing className="w-5 h-5"/>
                  </div>
                  <Badge_1.Badge variant={rem.status === 'completed' ? 'emerald' : 'amber'} size="sm">
                    {rem.status}
                  </Badge_1.Badge>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{rem.title}</h3>
                {rem.description && (<p className="text-xs text-slate-500 mt-1">{rem.description}</p>)}

                <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs">
                  {rem.target_mileage && (<p className="font-mono text-slate-800 font-bold flex items-center gap-1.5">
                      <lucide_react_1.Gauge className="w-3.5 h-3.5 text-indigo-600"/>
                      Целевой пробег: {rem.target_mileage.toLocaleString('ru-RU')} км
                    </p>)}
                  {rem.target_date && (<p className="text-slate-600 flex items-center gap-1.5">
                      <lucide_react_1.Calendar className="w-3.5 h-3.5 text-slate-400"/>
                      Дата: {new Date(rem.target_date).toLocaleDateString('ru-RU')}
                    </p>)}
                  {rem.vehicle && (<p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <lucide_react_1.Car className="w-3 h-3 text-slate-400"/>
                      {rem.vehicle.make} {rem.vehicle.model} ({rem.vehicle.license_plate})
                    </p>)}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                {rem.status !== 'completed' && (<Button_1.Button variant="outline" size="sm" onClick={() => handleComplete(rem.id)}>
                    <lucide_react_1.CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1"/>
                    Выполнено
                  </Button_1.Button>)}
              </div>
            </Card_1.Card>))}
        </div>)}

      {/* Modal */}
      <Modal_1.Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Новое сервисное напоминание">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select_1.Select label="Автомобиль" value={newRem.vehicle_id} onChange={(e) => setNewRem({ ...newRem, vehicle_id: e.target.value })} options={vehicles.map((v) => ({
            value: v.id,
            label: `${v.make} ${v.model} (${v.license_plate})`,
        }))} required/>

          <Input_1.Input label="Название напоминания" placeholder="например: Плановое ТО через 10 000 км" value={newRem.title} onChange={(e) => setNewRem({ ...newRem, title: e.target.value })} required/>

          <Input_1.Input label="Описание работ" placeholder="Замена масла ДВС, фильтров и свечей..." value={newRem.description} onChange={(e) => setNewRem({ ...newRem, description: e.target.value })}/>

          <div className="grid grid-cols-2 gap-3">
            <Input_1.Input label="Целевой пробег (км)" type="number" value={newRem.target_mileage} onChange={(e) => setNewRem({ ...newRem, target_mileage: Number(e.target.value) })}/>
            <Input_1.Input label="Целевая дата" type="date" value={newRem.target_date} onChange={(e) => setNewRem({ ...newRem, target_date: e.target.value })}/>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button_1.Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button_1.Button>
            <Button_1.Button variant="primary" type="submit">
              Сохранить
            </Button_1.Button>
          </div>
        </form>
      </Modal_1.Modal>
    </div>);
}
//# sourceMappingURL=page.js.map