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
exports.default = NewInspectionPage;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const auth_store_1 = require("../../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../../components/ui/Card");
const Button_1 = require("../../../components/ui/Button");
const Input_1 = require("../../../components/ui/Input");
const Select_1 = require("../../../components/ui/Select");
const FuelSlider_1 = require("../../../components/ui/FuelSlider");
const DamageMarkingCanvas_1 = require("../../../components/ui/DamageMarkingCanvas");
function NewInspectionContent() {
    const router = (0, navigation_1.useRouter)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const initialVehicleId = searchParams.get('vehicle_id');
    const initialCustomerId = searchParams.get('customer_id');
    const { api, user, currentLocation } = (0, auth_store_1.useAuthStore)();
    const [step, setStep] = (0, react_1.useState)(1);
    const [customers, setCustomers] = (0, react_1.useState)([]);
    const [vehicles, setVehicles] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    // Form State
    const [selectedCustomerId, setSelectedCustomerId] = (0, react_1.useState)(initialCustomerId || '');
    const [selectedVehicleId, setSelectedVehicleId] = (0, react_1.useState)(initialVehicleId || '');
    const [mileage, setMileage] = (0, react_1.useState)(142300);
    const [fuelLevel, setFuelLevel] = (0, react_1.useState)(75);
    const [customerComment, setCustomerComment] = (0, react_1.useState)('Плановое техническое обслуживание и диагностика');
    const [internalComment, setInternalComment] = (0, react_1.useState)('');
    // Checklist items (Section 66)
    const [checklist, setChecklist] = (0, react_1.useState)([
        { id: '1', category: 'body', name: 'Передний бампер и оптика', status: 'not_checked', comment: '' },
        { id: '2', category: 'body', name: 'Левая сторона (крылья, двери)', status: 'ok', comment: '' },
        { id: '3', category: 'body', name: 'Правая сторона (крылья, двери)', status: 'ok', comment: '' },
        { id: '4', category: 'body', name: 'Задняя часть и багажник', status: 'ok', comment: '' },
        { id: '5', category: 'body', name: 'Крыша и остекление', status: 'ok', comment: '' },
        { id: '6', category: 'interior', name: 'Передние сиденья и ремни', status: 'ok', comment: '' },
        { id: '7', category: 'interior', name: 'Задний ряд сидений', status: 'ok', comment: '' },
        { id: '8', category: 'interior', name: 'Приборная панель и мультимедиа', status: 'ok', comment: '' },
    ]);
    // Damage markers for photos (Section 67)
    const [damageMarkers, setDamageMarkers] = (0, react_1.useState)([
        { x: 50, y: 50, severity: 'minor', comment: 'Скол лакокрасочного покрытия' },
    ]);
    // Photo / video simulation states
    const [photosCount, setPhotosCount] = (0, react_1.useState)(4);
    const [hasVideo, setHasVideo] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            try {
                const [cRes, vRes] = await Promise.all([
                    api.getCustomers({ limit: 100 }),
                    api.getVehicles({ limit: 100 }),
                ]);
                setCustomers(cRes.data || []);
                setVehicles(vRes.data || []);
                if (initialVehicleId) {
                    const veh = vRes.data?.find((v) => v.id === initialVehicleId);
                    if (veh) {
                        setSelectedVehicleId(veh.id);
                        setSelectedCustomerId(veh.customer_id);
                        setMileage(veh.mileage || 142300);
                    }
                }
                else if (vRes.data && vRes.data.length > 0) {
                    setSelectedVehicleId(vRes.data[0].id);
                    setSelectedCustomerId(vRes.data[0].customer_id);
                    setMileage(vRes.data[0].mileage || 142300);
                }
            }
            catch (err) {
                console.error('Error fetching data:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [api, initialVehicleId]);
    const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    const handleChecklistChange = (id, status) => {
        setChecklist(checklist.map((item) => (item.id === id ? { ...item, status } : item)));
    };
    const handleFinishInspection = async () => {
        if (!selectedVehicleId || !selectedCustomerId) {
            alert('Пожалуйста, выберите автомобиль и клиента');
            return;
        }
        setIsSubmitting(true);
        try {
            // 1. Create inspection
            const insp = await api.createInspection({
                location_id: currentLocation?.id,
                vehicle_id: selectedVehicleId,
                customer_id: selectedCustomerId,
                mileage: Number(mileage),
                fuel_level: Number(fuelLevel),
                customer_comment: customerComment,
                internal_comment: internalComment,
                items: checklist,
            });
            // 2. Complete inspection
            await api.completeInspection(insp.data.id);
            // 3. Create Work Order from inspection (Main business scenario Section 1 & 111)
            const wo = await api.createWorkOrder({
                location_id: currentLocation?.id,
                vehicle_id: selectedVehicleId,
                customer_id: selectedCustomerId,
                inspection_id: insp.data.id,
                mileage_in: Number(mileage),
                customer_complaint: customerComment,
                status: 'waiting_approval',
                items: [
                    { type: 'labor', description: 'Замена моторного масла и фильтра', quantity: 1, unit_price: 4800 },
                    { type: 'labor', description: 'Компьютерная диагностика систем', quantity: 1, unit_price: 2500 },
                    { type: 'part', description: 'Масляный фильтр оригинальный', quantity: 1, unit_price: 800 },
                ],
            });
            // Navigate to created work order
            router.push(`/work-orders/${wo.data.id}`);
        }
        catch (err) {
            alert(err.message || 'Ошибка сохранения приемки');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading) {
        return <div className="text-center py-16 text-slate-500 text-sm">Подготовка мастера приемки...</div>;
    }
    return (<div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <lucide_react_1.ClipboardCheck className="w-7 h-7 text-indigo-600"/> Новая приемка автомобиля
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Пошаговый мастер оформления визита и фиксации состояния автомобиля
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
          Шаг {step} из 4
        </span>
      </div>

      {/* Wizard Progress Bar */}
      <div className="grid grid-cols-4 gap-2">
        {['1. Данные авто', '2. Чек-лист', '3. Фото и дефекты', '4. Сохранение'].map((title, idx) => (<div key={idx} className={`h-2 rounded-full transition-all ${step > idx + 1 ? 'bg-emerald-500' : step === idx + 1 ? 'bg-indigo-600' : 'bg-slate-200'}`}/>))}
      </div>

      {/* STEP 1: CLIENT & VEHICLE (Section 65) */}
      {step === 1 && (<Card_1.Card title="Шаг 1: Идентификация клиента и автомобиля">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select_1.Select label="Клиент" value={selectedCustomerId} onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                const relatedVeh = vehicles.find((v) => v.customer_id === e.target.value);
                if (relatedVeh)
                    setSelectedVehicleId(relatedVeh.id);
            }} options={customers.map((c) => ({
                value: c.id,
                label: `${c.first_name} ${c.last_name} (${c.phone})`,
            }))}/>

              <Select_1.Select label="Автомобиль" value={selectedVehicleId} onChange={(e) => {
                setSelectedVehicleId(e.target.value);
                const veh = vehicles.find((v) => v.id === e.target.value);
                if (veh) {
                    setSelectedCustomerId(veh.customer_id);
                    setMileage(veh.mileage || mileage);
                }
            }} options={vehicles.map((v) => ({
                value: v.id,
                label: `${v.make} ${v.model} [${v.license_plate}]`,
            }))}/>
            </div>

            {selectedVehicle && (<div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">VIN код:</span>
                  <p className="font-mono font-bold text-slate-800">{selectedVehicle.vin}</p>
                </div>
                <div>
                  <span className="text-slate-400">Госномер:</span>
                  <p className="font-mono font-bold text-slate-800">{selectedVehicle.license_plate}</p>
                </div>
                <div>
                  <span className="text-slate-400">Год / Цвет:</span>
                  <p className="font-semibold text-slate-800">{selectedVehicle.year} г. • {selectedVehicle.color || 'Черный'}</p>
                </div>
              </div>)}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input_1.Input label="Текущий пробег (км)" type="number" icon={<lucide_react_1.Gauge className="w-4 h-4"/>} value={mileage} onChange={(e) => setMileage(Number(e.target.value))} required/>

              <FuelSlider_1.FuelSlider value={fuelLevel} onChange={setFuelLevel}/>
            </div>

            <Input_1.Input label="Причина обращения / Жалоба клиента" value={customerComment} onChange={(e) => setCustomerComment(e.target.value)} placeholder="Опишите причину визита..."/>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button_1.Button variant="primary" size="lg" onClick={() => setStep(2)}>
                <span>Начать осмотр (Шаг 2)</span>
                <lucide_react_1.ArrowRight className="w-4 h-4 ml-1"/>
              </Button_1.Button>
            </div>
          </div>
        </Card_1.Card>)}

      {/* STEP 2: CHECKLIST (Section 66) */}
      {step === 2 && (<Card_1.Card title="Шаг 2: Чек-лист первичного осмотра (Кузов и Салон)">
          <div className="space-y-6">
            {/* Body Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Кузов автомобиля
              </h4>
              <div className="space-y-2">
                {checklist.filter((i) => i.category === 'body').map((item) => (<div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                    <div className="flex items-center gap-1">
                      {['ok', 'warning', 'damage'].map((st) => (<button key={st} type="button" onClick={() => handleChecklistChange(item.id, st)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${item.status === st
                        ? st === 'ok'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : st === 'warning'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                          {st === 'ok' ? 'Норма' : st === 'warning' ? 'Замечание' : 'Дефект'}
                        </button>))}
                    </div>
                  </div>))}
              </div>
            </div>

            {/* Interior Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Салон автомобиля
              </h4>
              <div className="space-y-2">
                {checklist.filter((i) => i.category === 'interior').map((item) => (<div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                    <div className="flex items-center gap-1">
                      {['ok', 'warning', 'damage'].map((st) => (<button key={st} type="button" onClick={() => handleChecklistChange(item.id, st)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${item.status === st
                        ? st === 'ok'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : st === 'warning'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                          {st === 'ok' ? 'Норма' : st === 'warning' ? 'Замечание' : 'Дефект'}
                        </button>))}
                    </div>
                  </div>))}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button_1.Button variant="outline" size="md" onClick={() => setStep(1)}>
                <lucide_react_1.ArrowLeft className="w-4 h-4 mr-1"/>
                Назад
              </Button_1.Button>
              <Button_1.Button variant="primary" size="lg" onClick={() => setStep(3)}>
                <span>Фото и дефекты (Шаг 3)</span>
                <lucide_react_1.ArrowRight className="w-4 h-4 ml-1"/>
              </Button_1.Button>
            </div>
          </div>
        </Card_1.Card>)}

      {/* STEP 3: PHOTOS & DAMAGE MARKING (Section 67) */}
      {step === 3 && (<Card_1.Card title="Шаг 3: Фото, видео и отметки повреждений">
          <div className="space-y-6">
            {/* Interactive Car Blueprint Damage Marking Canvas */}
            <DamageMarkingCanvas_1.DamageMarkingCanvas markers={damageMarkers} onChange={setDamageMarkers}/>

            {/* Media capture badges */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Медиафайлы осмотра
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Camera className="w-5 h-5 text-indigo-600"/>
                    <span className="text-xs font-bold text-slate-800">4 фотографии кузова</span>
                  </div>
                  <lucide_react_1.CheckCircle2 className="w-4 h-4 text-emerald-500"/>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Video className="w-5 h-5 text-sky-600"/>
                    <span className="text-xs font-bold text-slate-800">Видео кругового осмотра</span>
                  </div>
                  <lucide_react_1.CheckCircle2 className="w-4 h-4 text-emerald-500"/>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button_1.Button variant="outline" size="md" onClick={() => setStep(2)}>
                <lucide_react_1.ArrowLeft className="w-4 h-4 mr-1"/>
                Назад
              </Button_1.Button>
              <Button_1.Button variant="primary" size="lg" onClick={() => setStep(4)}>
                <span>Итог приемки (Шаг 4)</span>
                <lucide_react_1.ArrowRight className="w-4 h-4 ml-1"/>
              </Button_1.Button>
            </div>
          </div>
        </Card_1.Card>)}

      {/* STEP 4: SUMMARY & WORK ORDER CREATION (Section 1 & 111) */}
      {step === 4 && (<Card_1.Card title="Шаг 4: Подтверждение и создание заказ-наряда">
          <div className="space-y-5">
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Автомобиль и клиент</span>
                <span className="font-mono text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded">
                  {selectedVehicle?.license_plate}
                </span>
              </div>
              <p className="text-base font-bold text-slate-900">
                {selectedVehicle?.make} {selectedVehicle?.model} ({selectedVehicle?.year} г.в.)
              </p>
              <p className="text-xs text-slate-600 font-mono">
                VIN: {selectedVehicle?.vin} • Пробег: {mileage.toLocaleString('ru-RU')} км • Топливо: {fuelLevel}%
              </p>
              <p className="text-xs text-slate-700">
                Владелец: <strong>{selectedCustomer?.first_name} {selectedCustomer?.last_name}</strong> ({selectedCustomer?.phone})
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-800">Зафиксировано дефектов кузова: <span className="text-rose-600">{damageMarkers.length}</span></p>
              <p className="text-slate-600">Причина обращения: {customerComment}</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
              <lucide_react_1.Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"/>
              <div>
                <p className="font-bold">Автоматическое формирование заказ-наряда (Section 1 & 111)</p>
                <p className="mt-0.5 text-emerald-800">
                  При сохранении приемки будет автоматически открыт рабочий заказ-наряд, добавлены первичные работы по регламенту ТО и обновлена цифровая история автомобиля.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button_1.Button variant="outline" size="md" onClick={() => setStep(3)}>
                <lucide_react_1.ArrowLeft className="w-4 h-4 mr-1"/>
                Назад
              </Button_1.Button>
              <Button_1.Button variant="success" size="lg" isLoading={isSubmitting} onClick={handleFinishInspection} className="font-bold shadow-lg shadow-emerald-600/30">
                <lucide_react_1.Check className="w-5 h-5 mr-1"/>
                <span>Завершить приемку и создать заказ</span>
              </Button_1.Button>
            </div>
          </div>
        </Card_1.Card>)}
    </div>);
}
function NewInspectionPage() {
    return (<react_1.Suspense fallback={<div className="text-center py-16">Загрузка...</div>}>
      <NewInspectionContent />
    </react_1.Suspense>);
}
//# sourceMappingURL=page.js.map