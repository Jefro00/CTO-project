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
exports.default = VehicleDetailPage;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
const auth_store_1 = require("../../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../../components/ui/Card");
const Button_1 = require("../../../components/ui/Button");
const Badge_1 = require("../../../components/ui/Badge");
const Modal_1 = require("../../../components/ui/Modal");
function VehicleDetailPage() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const vehicleId = params?.id;
    const { api } = (0, auth_store_1.useAuthStore)();
    const [vehicle, setVehicle] = (0, react_1.useState)(null);
    const [history, setHistory] = (0, react_1.useState)([]);
    const [workOrders, setWorkOrders] = (0, react_1.useState)([]);
    const [inspections, setInspections] = (0, react_1.useState)([]);
    const [documents, setDocuments] = (0, react_1.useState)([]);
    const [mediaList, setMediaList] = (0, react_1.useState)([]);
    const [reminders, setReminders] = (0, react_1.useState)([]);
    const [activeTab, setActiveTab] = (0, react_1.useState)('timeline');
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    // Selected timeline event modal
    const [selectedEvent, setSelectedEvent] = (0, react_1.useState)(null);
    const [selectedPhoto, setSelectedPhoto] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!vehicleId)
            return;
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [vRes, hRes, woRes, inspRes, docRes, remRes] = await Promise.all([
                    api.getVehicle(vehicleId),
                    api.getVehicleHistory(vehicleId),
                    api.getWorkOrders({ vehicle_id: vehicleId }),
                    api.getInspections({ vehicle_id: vehicleId }),
                    api.getDocuments({ vehicle_id: vehicleId }),
                    api.getReminders({ vehicle_id: vehicleId }),
                ]);
                setVehicle(vRes.data);
                setHistory(hRes.data || []);
                setWorkOrders(woRes.data || []);
                setInspections(inspRes.data || []);
                setDocuments(docRes.data || []);
                setReminders(remRes.data || []);
                // Filter media from inspections
                const allMedia = [];
                if (inspRes.data) {
                    for (const insp of inspRes.data) {
                        if (insp.media)
                            allMedia.push(...insp.media);
                    }
                }
                setMediaList(allMedia);
            }
            catch (err) {
                console.error('Error fetching vehicle details:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [vehicleId, api]);
    if (isLoading) {
        return <div className="text-center py-16 text-slate-500 text-sm">Загрузка карточки автомобиля...</div>;
    }
    if (!vehicle) {
        return (<div className="text-center py-16 space-y-3">
        <lucide_react_1.Car className="w-12 h-12 text-slate-300 mx-auto"/>
        <h2 className="text-lg font-bold text-slate-800">Автомобиль не найден</h2>
        <link_1.default href="/vehicles">
          <Button_1.Button variant="outline" size="sm">
            Вернуться в список
          </Button_1.Button>
        </link_1.default>
      </div>);
    }
    const photos = mediaList.filter((m) => m.type === 'photo');
    const videos = mediaList.filter((m) => m.type === 'video');
    const tabs = [
        { id: 'overview', label: 'Обзор', icon: lucide_react_1.Car },
        { id: 'timeline', label: `История (${history.length})`, icon: lucide_react_1.Clock },
        { id: 'orders', label: `Заказы (${workOrders.length})`, icon: lucide_react_1.Wrench },
        { id: 'documents', label: `Документы (${documents.length})`, icon: lucide_react_1.FileText },
        { id: 'photos', label: `Фото (${photos.length})`, icon: lucide_react_1.Camera },
        { id: 'videos', label: `Видео (${videos.length})`, icon: lucide_react_1.Video },
        { id: 'recommendations', label: 'Рекомендации', icon: lucide_react_1.Lightbulb },
        { id: 'reminders', label: `Напоминания (${reminders.length})`, icon: lucide_react_1.BellRing },
    ];
    return (<div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <lucide_react_1.ArrowLeft className="w-4 h-4"/>
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {vehicle.make} {vehicle.model}
              </h1>
              <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2.5 py-1 rounded-lg shadow-xs">
                {vehicle.license_plate}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              VIN: <strong className="text-slate-800">{vehicle.vin}</strong> • {vehicle.year} г.в.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <link_1.default href={`/inspections/new?vehicle_id=${vehicle.id}&customer_id=${vehicle.customer_id}`}>
            <Button_1.Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20">
              <lucide_react_1.Plus className="w-4 h-4"/>
              <span>Новая приемка</span>
            </Button_1.Button>
          </link_1.default>
          <link_1.default href={`/work-orders?new=true&vehicle_id=${vehicle.id}`}>
            <Button_1.Button variant="outline" size="md" className="font-semibold">
              <lucide_react_1.Wrench className="w-4 h-4 text-slate-600"/>
              <span>Создать заказ</span>
            </Button_1.Button>
          </link_1.default>
        </div>
      </div>

      {/* Main Vehicle Header Card (Section 63) */}
      <Card_1.Card className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white border-0 shadow-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Владелец ТС</span>
            <p className="text-base font-bold text-white mt-1">
              {vehicle.customer?.first_name} {vehicle.customer?.last_name}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <lucide_react_1.Phone className="w-3 h-3 text-indigo-400"/> {vehicle.customer?.phone}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Текущий пробег</span>
            <p className="text-2xl font-black text-sky-400 font-mono mt-0.5">
              {vehicle.mileage.toLocaleString('ru-RU')} <span className="text-xs font-normal text-slate-300">км</span>
            </p>
            <p className="text-[10px] text-slate-400">Обновлено при последней приемке</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Двигатель & КПП</span>
            <p className="text-sm font-bold text-white mt-1">
              {vehicle.engine || '3.0 л Turbo'}
            </p>
            <p className="text-xs text-slate-400">
              {vehicle.transmission || 'АКПП'} • {vehicle.drive_type || 'Полный привод'}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Статус автомобиля</span>
            <div className="mt-1">
              <Badge_1.Badge variant={vehicle.status === 'in_service' ? 'amber' : 'emerald'} size="md">
                {vehicle.status === 'in_service' ? 'В обслуживании СТО' : 'Активен'}
              </Badge_1.Badge>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Всего визитов: {workOrders.length + inspections.length}
            </p>
          </div>
        </div>
      </Card_1.Card>

      {/* Navigation Tabs (Section 63) */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
                <Icon className="w-4 h-4"/>
                <span>{tab.label}</span>
              </button>);
        })}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card_1.Card title="Технические характеристики">
            <dl className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Марка и модель</dt>
                <dd className="font-bold text-slate-900">{vehicle.make} {vehicle.model} ({vehicle.generation || '—'})</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">VIN номер</dt>
                <dd className="font-mono font-bold text-slate-900">{vehicle.vin}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Государственный номер</dt>
                <dd className="font-mono font-bold text-slate-900">{vehicle.license_plate}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Год выпуска</dt>
                <dd className="font-semibold text-slate-900">{vehicle.year}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Цвет кузова</dt>
                <dd className="font-semibold text-slate-900">{vehicle.color || 'Черный сапфир'}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Тип топлива</dt>
                <dd className="font-semibold text-slate-900">{vehicle.fuel_type || 'Бензин'}</dd>
              </div>
              <div className="py-2.5 flex justify-between">
                <dt className="text-slate-500">Примечания автосервиса</dt>
                <dd className="text-slate-700 italic max-w-xs text-right">{vehicle.notes || 'Обслуживание по регламенту'}</dd>
              </div>
            </dl>
          </Card_1.Card>

          <Card_1.Card title="Владелец и контактные данные">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                  {vehicle.customer?.first_name?.[0]}
                  {vehicle.customer?.last_name?.[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {vehicle.customer?.first_name} {vehicle.customer?.last_name}
                  </h4>
                  <p className="text-xs text-slate-500">{vehicle.customer?.phone}</p>
                </div>
              </div>

              <div className="text-xs space-y-2 text-slate-600">
                <p><strong>Email:</strong> {vehicle.customer?.email || '—'}</p>
                <p><strong>Адрес:</strong> {vehicle.customer?.address || 'Москва'}</p>
                <p><strong>Заметки о клиенте:</strong> {vehicle.customer?.notes || 'Постоянный клиент'}</p>
              </div>

              <div className="pt-2">
                <link_1.default href={`/customers/${vehicle.customer_id}`}>
                  <Button_1.Button variant="outline" size="sm" className="w-full">
                    <lucide_react_1.User className="w-4 h-4 mr-1"/>
                    Перейти в профиль клиента
                  </Button_1.Button>
                </link_1.default>
              </div>
            </div>
          </Card_1.Card>
        </div>)}

      {/* TAB 2: UNIFIED TIMELINE HISTORY (Section 64) */}
      {activeTab === 'timeline' && (<Card_1.Card title="Хронологическая цифровая история автомобиля (Timeline)" subtitle="Каждый визит, осмотр, заказ-наряд, фото и документ объединены в единую цепочку событий">
          {history.length === 0 ? (<div className="text-center py-12 text-xs text-slate-400">История пуста</div>) : (<div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {history.map((event, idx) => {
                    const eventIcons = {
                        inspection: ClipboardCheck,
                        work_order: lucide_react_1.Wrench,
                        document: lucide_react_1.FileText,
                        media: lucide_react_1.Camera,
                        reminder: lucide_react_1.BellRing,
                        task: lucide_react_1.CheckCircle2,
                    };
                    const eventColors = {
                        inspection: 'bg-sky-500 text-white ring-sky-100',
                        work_order: 'bg-indigo-600 text-white ring-indigo-100',
                        document: 'bg-emerald-500 text-white ring-emerald-100',
                        media: 'bg-purple-500 text-white ring-purple-100',
                        reminder: 'bg-amber-500 text-white ring-amber-100',
                        task: 'bg-slate-700 text-white ring-slate-100',
                    };
                    const Icon = eventIcons[event.type] || lucide_react_1.Clock;
                    return (<div key={event.id || idx} onClick={() => setSelectedEvent(event)} className="relative group cursor-pointer">
                    {/* Timeline Node Point */}
                    <div className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 transition-transform group-hover:scale-125 shadow-sm ${eventColors[event.type] || 'bg-slate-500 text-white ring-slate-100'}`}>
                      <Icon className="w-3.5 h-3.5"/>
                    </div>

                    {/* Timeline Item Card */}
                    <div className="bg-slate-50/70 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200/80 transition-all shadow-2xs group-hover:shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {event.title}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(event.created_at).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}
                        </span>
                      </div>
                      {event.description && (<p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{event.description}</p>)}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 text-[10px] text-slate-400">
                        <span>Исполнитель: {event.user_name || 'Сотрудник СТО'}</span>
                        {event.status && (<Badge_1.Badge variant="gray" size="sm">
                            {event.status}
                          </Badge_1.Badge>)}
                      </div>
                    </div>
                  </div>);
                })}
            </div>)}
        </Card_1.Card>)}

      {/* TAB 3: WORK ORDERS (Section 68) */}
      {activeTab === 'orders' && (<div className="space-y-4">
          {workOrders.length === 0 ? (<Card_1.Card className="text-center py-12 text-slate-500 text-xs">Заказ-нарядов пока нет</Card_1.Card>) : (workOrders.map((wo) => (<Card_1.Card key={wo.id} className="hover:border-indigo-200 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-black px-3 py-1 bg-slate-900 text-white rounded-lg">
                      #{wo.number}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Заказ-наряд от {new Date(wo.opened_at).toLocaleDateString('ru-RU')}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Мастер-приемщик: {wo.advisor?.first_name} {wo.advisor?.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Итоговая сумма:</span>
                      <p className="text-lg font-black text-indigo-600 font-mono">
                        {wo.total.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <Badge_1.Badge variant={wo.status === 'closed' ? 'emerald' : 'amber'} size="md">
                      {wo.status}
                    </Badge_1.Badge>
                  </div>
                </div>

                {/* Items preview table */}
                <div className="mt-3">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100 uppercase text-[10px]">
                        <th className="py-1.5">Наименование работы / детали</th>
                        <th className="py-1.5 text-center">Кол-во</th>
                        <th className="py-1.5 text-right">Цена</th>
                        <th className="py-1.5 text-right">Сумма</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {wo.items?.map((item) => (<tr key={item.id} className="text-slate-700">
                          <td className="py-1.5 font-medium">{item.description}</td>
                          <td className="py-1.5 text-center">{item.quantity}</td>
                          <td className="py-1.5 text-right">{item.unit_price.toLocaleString('ru-RU')} ₽</td>
                          <td className="py-1.5 text-right font-semibold">{item.total_price.toLocaleString('ru-RU')} ₽</td>
                        </tr>))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <link_1.default href={`/work-orders/${wo.id}`}>
                    <Button_1.Button variant="outline" size="sm">
                      Открыть заказ-наряд
                    </Button_1.Button>
                  </link_1.default>
                </div>
              </Card_1.Card>)))}
        </div>)}

      {/* TAB 4: DOCUMENTS (Section 46) */}
      {activeTab === 'documents' && (<Card_1.Card title="Сформированные документы и акты">
          {documents.length === 0 ? (<div className="text-center py-12 text-slate-400 text-xs">Документов пока нет</div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc) => (<div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <lucide_react_1.FileText className="w-6 h-6 text-indigo-600 shrink-0"/>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-xs text-slate-500 uppercase">{doc.type} • {doc.is_signed ? 'Подписан' : 'Черновик'}</p>
                    </div>
                  </div>
                  <link_1.default href="/documents">
                    <Button_1.Button variant="outline" size="sm">
                      Просмотр
                    </Button_1.Button>
                  </link_1.default>
                </div>))}
            </div>)}
        </Card_1.Card>)}

      {/* TAB 5: PHOTOS (Section 67) */}
      {activeTab === 'photos' && (<Card_1.Card title="Фотографии осмотров и повреждений">
          {photos.length === 0 ? (<div className="text-center py-12 text-slate-400 text-xs">Фотографий пока нет</div>) : (<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {photos.map((p) => {
                    const markersCount = p.metadata?.damage_markers?.length || 0;
                    return (<div key={p.id} onClick={() => setSelectedPhoto(p)} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video cursor-pointer shadow-xs">
                    {/* Simulated Inspection Photo preview */}
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400 relative">
                      <lucide_react_1.Car className="w-12 h-12 opacity-40 text-sky-300"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"/>
                      <span className="absolute bottom-2 left-2 text-xs font-bold text-white truncate max-w-[80%]">
                        {p.file_name}
                      </span>
                      {markersCount > 0 && (<span className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {markersCount} дефекта
                        </span>)}
                    </div>
                  </div>);
                })}
            </div>)}
        </Card_1.Card>)}

      {/* TAB 6: VIDEOS */}
      {activeTab === 'videos' && (<Card_1.Card title="Видеозаписи кругового осмотра">
          {videos.length === 0 ? (<div className="text-center py-12 text-slate-400 text-xs">Видеозаписей пока нет</div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((v) => (<div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-white">
                  <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center relative mb-3">
                    <lucide_react_1.Video className="w-12 h-12 text-sky-400 opacity-60"/>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-[10px] font-mono">
                      {v.duration ? `${v.duration} сек` : '0:35'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold truncate">{v.file_name}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Снято: {new Date(v.created_at).toLocaleString('ru-RU')}
                  </p>
                </div>))}
            </div>)}
        </Card_1.Card>)}

      {/* TAB 7: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (<Card_1.Card title="Рекомендации автосервиса">
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
              <lucide_react_1.AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"/>
              <div>
                <h4 className="text-sm font-bold">Износ передних тормозных колодок 40%</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  При следующем визите (через 7 000 - 10 000 км) рекомендуется плановая замена переднего комплекта колодок и контроль толщины дисков.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-start gap-3">
              <lucide_react_1.Lightbulb className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5"/>
              <div>
                <h4 className="text-sm font-bold">Регламент замены масла в раздаточной коробке</h4>
                <p className="text-xs text-indigo-800 mt-0.5">
                  Рекомендуется замена спецжидкости xDrive на пробеге 150 000 км.
                </p>
              </div>
            </div>
          </div>
        </Card_1.Card>)}

      {/* TAB 8: REMINDERS (Section 48) */}
      {activeTab === 'reminders' && (<Card_1.Card title="Напоминания о техническом обслуживании">
          {reminders.length === 0 ? (<div className="text-center py-12 text-slate-400 text-xs">Напоминаний нет</div>) : (<div className="space-y-3">
              {reminders.map((r) => (<div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <lucide_react_1.BellRing className="w-5 h-5 text-amber-500"/>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{r.title}</h4>
                      <p className="text-xs text-slate-500">
                        {r.target_mileage ? `Целевой пробег: ${r.target_mileage.toLocaleString('ru-RU')} км` : ''}
                        {r.target_date ? ` • Дата: ${new Date(r.target_date).toLocaleDateString('ru-RU')}` : ''}
                      </p>
                    </div>
                  </div>
                  <Badge_1.Badge variant={r.status === 'active' ? 'amber' : 'emerald'} size="sm">
                    {r.status}
                  </Badge_1.Badge>
                </div>))}
            </div>)}
        </Card_1.Card>)}

      {/* Timeline Event Modal Details */}
      <Modal_1.Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent?.title || 'Событие истории'}>
        {selectedEvent && (<div className="space-y-4 text-sm text-slate-700">
            <p><strong>Дата и время:</strong> {new Date(selectedEvent.created_at).toLocaleString('ru-RU')}</p>
            <p><strong>Сотрудник:</strong> {selectedEvent.user_name || 'Мастер СТО'}</p>
            <p><strong>Описание:</strong> {selectedEvent.description || '—'}</p>
            {selectedEvent.metadata && (<div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono">
                <pre>{JSON.stringify(selectedEvent.metadata, null, 2)}</pre>
              </div>)}
            <div className="flex justify-end pt-3">
              <Button_1.Button variant="primary" size="sm" onClick={() => setSelectedEvent(null)}>
                Закрыть
              </Button_1.Button>
            </div>
          </div>)}
      </Modal_1.Modal>

      {/* Photo with Damage Markers Modal */}
      <Modal_1.Modal isOpen={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} title={selectedPhoto?.file_name || 'Фотография осмотра'} maxWidth="2xl">
        {selectedPhoto && (<div className="space-y-4">
            <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center text-white relative overflow-hidden">
              <lucide_react_1.Car className="w-20 h-20 text-slate-600"/>
              {/* Damage marker hotspots */}
              {selectedPhoto.metadata?.damage_markers?.map((dm, idx) => (<div key={idx} style={{ left: `${dm.x}%`, top: `${dm.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-600 border-2 border-white text-white font-bold text-xs flex items-center justify-center shadow-lg" title={dm.comment}>
                  X
                </div>))}
            </div>
            {selectedPhoto.metadata?.damage_markers && selectedPhoto.metadata.damage_markers.length > 0 && (<div className="space-y-1">
                <h5 className="text-xs font-bold uppercase text-slate-600">Зафиксированные повреждения:</h5>
                {selectedPhoto.metadata.damage_markers.map((dm, idx) => (<p key={idx} className="text-xs text-rose-700 font-medium">
                    • {dm.comment} ({dm.severity})
                  </p>))}
              </div>)}
          </div>)}
      </Modal_1.Modal>
    </div>);
}
//# sourceMappingURL=page.js.map