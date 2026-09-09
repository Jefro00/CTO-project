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
exports.default = ReportsPage;
const react_1 = __importStar(require("react"));
const auth_store_1 = require("../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../components/ui/Card");
function ReportsPage() {
    const { api } = (0, auth_store_1.useAuthStore)();
    const [vehiclesReport, setVehiclesReport] = (0, react_1.useState)(null);
    const [ordersReport, setOrdersReport] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const loadReports = async () => {
            try {
                const [vRes, oRes] = await Promise.all([
                    api.request('/reports/vehicles'),
                    api.request('/reports/work-orders'),
                ]);
                setVehiclesReport(vRes.data);
                setOrdersReport(oRes.data);
            }
            catch (err) {
                console.error('Error loading reports:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadReports();
    }, [api]);
    return (<div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <lucide_react_1.BarChart3 className="w-7 h-7 text-indigo-600"/> Аналитика и статистика автосервиса
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Базовые операционные и финансовые показатели СТО (Section 53 & 89)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card_1.Card className="p-5 bg-indigo-50 border-indigo-100">
          <span className="text-xs font-bold text-indigo-600 uppercase">Всего автомобилей в базе</span>
          <p className="text-3xl font-black text-indigo-950 mt-1 font-mono">
            {vehiclesReport?.totalVehicles ?? 3}
          </p>
        </Card_1.Card>

        <Card_1.Card className="p-5 bg-sky-50 border-sky-100">
          <span className="text-xs font-bold text-sky-600 uppercase">Всего заказов</span>
          <p className="text-3xl font-black text-sky-950 mt-1 font-mono">
            {ordersReport?.totalOrders ?? 3}
          </p>
        </Card_1.Card>

        <Card_1.Card className="p-5 bg-emerald-50 border-emerald-100">
          <span className="text-xs font-bold text-emerald-600 uppercase">Общая выручка</span>
          <p className="text-3xl font-black text-emerald-950 mt-1 font-mono">
            {(ordersReport?.totalRevenue ?? 30000).toLocaleString('ru-RU')} ₽
          </p>
        </Card_1.Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card_1.Card title="Распределение автопарка по маркам">
          <div className="space-y-3">
            {vehiclesReport?.byMake?.map((item) => (<div key={item.make} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-bold text-slate-900">{item.make}</span>
                <span className="font-mono text-xs font-bold bg-slate-200 px-2.5 py-1 rounded-md text-slate-800">
                  {item.count} авто
                </span>
              </div>))}
          </div>
        </Card_1.Card>

        <Card_1.Card title="Заказ-наряды по статусам">
          <div className="space-y-3">
            {ordersReport?.byStatus?.map((item) => (<div key={item.status} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-bold text-slate-900 uppercase text-xs">{item.status}</span>
                <span className="font-mono text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md">
                  {item.count} заказов
                </span>
              </div>))}
          </div>
        </Card_1.Card>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map