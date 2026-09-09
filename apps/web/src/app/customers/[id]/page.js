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
exports.default = CustomerDetailPage;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
const auth_store_1 = require("../../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../../components/ui/Card");
const Button_1 = require("../../../components/ui/Button");
function CustomerDetailPage() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const customerId = params?.id;
    const { api } = (0, auth_store_1.useAuthStore)();
    const [customer, setCustomer] = (0, react_1.useState)(null);
    const [vehicles, setVehicles] = (0, react_1.useState)([]);
    const [workOrders, setWorkOrders] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (!customerId)
            return;
        const loadCustomer = async () => {
            setIsLoading(true);
            try {
                const res = await api.getCustomer(customerId);
                setCustomer(res.data);
                setVehicles(res.data.vehicles || []);
                setWorkOrders(res.data.workOrders || []);
            }
            catch (err) {
                console.error('Error fetching customer:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadCustomer();
    }, [customerId, api]);
    if (isLoading) {
        return <div className="text-center py-16 text-slate-500 text-sm">Загрузка клиента...</div>;
    }
    if (!customer) {
        return <div className="text-center py-16">Клиент не найден</div>;
    }
    return (<div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          <lucide_react_1.ArrowLeft className="w-4 h-4"/>
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {customer.first_name} {customer.last_name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Карточка постоянного клиента автосервиса</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card_1.Card title="Контактная информация" className="md:col-span-1">
          <div className="space-y-3 text-xs text-slate-700">
            <p className="flex items-center gap-2">
              <lucide_react_1.Phone className="w-4 h-4 text-indigo-600"/>
              <strong>{customer.phone}</strong>
            </p>
            {customer.email && (<p className="flex items-center gap-2">
                <lucide_react_1.Mail className="w-4 h-4 text-slate-400"/>
                <span>{customer.email}</span>
              </p>)}
            {customer.address && (<p className="flex items-center gap-2">
                <lucide_react_1.MapPin className="w-4 h-4 text-slate-400"/>
                <span>{customer.address}</span>
              </p>)}
            {customer.notes && (<div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400">Примечания:</span>
                <p className="italic text-slate-600 mt-0.5">{customer.notes}</p>
              </div>)}
          </div>
        </Card_1.Card>

        {/* Vehicles */}
        <Card_1.Card title={`Автомобили клиента (${vehicles.length})`} className="md:col-span-2" action={<link_1.default href="/vehicles">
              <Button_1.Button size="sm" variant="outline">
                <lucide_react_1.Plus className="w-3.5 h-3.5 mr-1"/>
                Привязать авто
              </Button_1.Button>
            </link_1.default>}>
          {vehicles.length === 0 ? (<div className="text-center py-6 text-xs text-slate-400">У клиента пока нет привязанных авто</div>) : (<div className="space-y-2">
              {vehicles.map((v) => (<link_1.default key={v.id} href={`/vehicles/${v.id}`} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 transition-colors group">
                  <div className="flex items-center gap-3">
                    <lucide_react_1.Car className="w-5 h-5 text-indigo-600"/>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                        {v.make} {v.model} ({v.year})
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Госномер: {v.license_plate} • Пробег: {v.mileage.toLocaleString('ru-RU')} км
                      </p>
                    </div>
                  </div>
                  <lucide_react_1.ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"/>
                </link_1.default>))}
            </div>)}
        </Card_1.Card>
      </div>

      {/* Orders */}
      <Card_1.Card title="История обращений и заказ-нарядов">
        {workOrders.length === 0 ? (<div className="text-center py-6 text-xs text-slate-400">Нет выполненных заказов</div>) : (<div className="divide-y divide-slate-100">
            {workOrders.map((wo) => (<link_1.default key={wo.id} href={`/work-orders/${wo.id}`} className="py-3 flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-900">Заказ-наряд #{wo.number}</p>
                  <p className="text-xs text-slate-500">
                    Дата: {new Date(wo.opened_at).toLocaleDateString('ru-RU')} • Статус: {wo.status}
                  </p>
                </div>
                <div className="text-right font-mono font-bold text-indigo-600">
                  {wo.total.toLocaleString('ru-RU')} ₽
                </div>
              </link_1.default>))}
          </div>)}
      </Card_1.Card>
    </div>);
}
//# sourceMappingURL=page.js.map