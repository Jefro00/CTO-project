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
exports.default = DashboardPage;
const react_1 = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
const auth_store_1 = require("../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../components/ui/Card");
const Button_1 = require("../../components/ui/Button");
const Badge_1 = require("../../components/ui/Badge");
function DashboardPage() {
    const { user, organization, api } = (0, auth_store_1.useAuthStore)();
    const [report, setReport] = (0, react_1.useState)(null);
    const [recentOrders, setRecentOrders] = (0, react_1.useState)([]);
    const [recentInspections, setRecentInspections] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const loadDashboard = async () => {
            try {
                const [repRes, ordersRes, inspRes] = await Promise.all([
                    api.getDashboardReport(),
                    api.getWorkOrders({ limit: 5 }),
                    api.getInspections({ limit: 5 }),
                ]);
                setReport(repRes.data);
                setRecentOrders(ordersRes.data || []);
                setRecentInspections(inspRes.data || []);
            }
            catch (err) {
                console.error('Error loading dashboard:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadDashboard();
    }, [api]);
    const kpis = [
        { label: 'Автомобилей сегодня', value: report?.vehiclesToday ?? 3, icon: lucide_react_1.Car, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
        { label: 'Приемок', value: report?.inspectionsToday ?? 1, icon: lucide_react_1.ClipboardCheck, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
        { label: 'В работе', value: report?.workOrdersActive ?? 2, icon: lucide_react_1.Wrench, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
        { label: 'Готово к выдаче', value: report?.workOrdersCompleted ?? 1, icon: lucide_react_1.CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        { label: 'Средний чек', value: `${(report?.averageCheck ?? 8400).toLocaleString('ru-RU')} ₽`, icon: lucide_react_1.TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    ];
    return (<div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Главный экран СТО
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {organization?.name || 'JEFRO AUTO'} • Сегодня: {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <link_1.default href="/inspections/new">
            <Button_1.Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20">
              <lucide_react_1.Plus className="w-4 h-4"/>
              <span>Новая приемка (Check-in)</span>
            </Button_1.Button>
          </link_1.default>
          <link_1.default href="/work-orders">
            <Button_1.Button variant="outline" size="md" className="font-semibold">
              <lucide_react_1.Wrench className="w-4 h-4 text-slate-600"/>
              <span>Заказ-наряды</span>
            </Button_1.Button>
          </link_1.default>
        </div>
      </div>

      {/* KPI Cards (Section 62) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (<div key={idx} className={`p-4 rounded-2xl border ${kpi.bg} shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-600">{kpi.label}</span>
                <Icon className={`w-5 h-5 ${kpi.color}`}/>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {kpi.value}
              </div>
            </div>);
        })}
      </div>

      {/* Section 62: "Требуют внимания" Widget */}
      {report?.attentionItems && report.attentionItems.length > 0 && (<Card_1.Card title={<div className="flex items-center gap-2 text-rose-600 font-bold">
              <lucide_react_1.AlertTriangle className="w-5 h-5"/>
              <span>Требуют внимания ({report.attentionItems.length})</span>
            </div>} className="border-rose-200 bg-rose-50/20">
          <div className="space-y-2">
            {report.attentionItems.map((item) => (<link_1.default key={item.id} href={item.link} className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-100 hover:border-rose-300 transition-all shadow-2xs group">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"/>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                  </div>
                </div>
                <lucide_react_1.ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all"/>
              </link_1.default>))}
          </div>
        </Card_1.Card>)}

      {/* Work Orders in Progress & Today's Inspections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Work Orders */}
        <Card_1.Card title="Активные заказ-наряды" action={<link_1.default href="/work-orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <span>Все заказы</span>
              <lucide_react_1.ArrowRight className="w-3.5 h-3.5"/>
            </link_1.default>}>
          {recentOrders.length === 0 ? (<div className="text-center py-8 text-xs text-slate-400">Нет активных заказ-нарядов</div>) : (<div className="divide-y divide-slate-100">
              {recentOrders.map((wo) => (<link_1.default key={wo.id} href={`/work-orders/${wo.id}`} className="py-3 flex items-center justify-between hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
                      #{wo.number}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                        {wo.vehicle?.make} {wo.vehicle?.model}{' '}
                        <span className="font-mono text-xs font-normal text-slate-500">({wo.vehicle?.license_plate})</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {wo.customer?.first_name} {wo.customer?.last_name} • {wo.items?.length || 0} поз.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{wo.total.toLocaleString('ru-RU')} ₽</p>
                    <Badge_1.Badge variant={wo.status === 'in_progress' ? 'amber' : wo.status === 'completed' ? 'emerald' : 'indigo'} size="sm">
                      {wo.status}
                    </Badge_1.Badge>
                  </div>
                </link_1.default>))}
            </div>)}
        </Card_1.Card>

        {/* Inspections / Check-in Feed */}
        <Card_1.Card title="Приемки и осмотры автомобилей" action={<link_1.default href="/inspections" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <span>Журнал приемок</span>
              <lucide_react_1.ArrowRight className="w-3.5 h-3.5"/>
            </link_1.default>}>
          {recentInspections.length === 0 ? (<div className="text-center py-8 text-xs text-slate-400">Нет записей приемок</div>) : (<div className="divide-y divide-slate-100">
              {recentInspections.map((insp) => (<link_1.default key={insp.id} href={`/inspections/${insp.id}`} className="py-3 flex items-center justify-between hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                      <lucide_react_1.ClipboardCheck className="w-5 h-5"/>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-sky-600">
                        {insp.vehicle?.make} {insp.vehicle?.model}{' '}
                        <span className="font-mono text-xs font-normal text-slate-500">({insp.vehicle?.license_plate})</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Пробег: {insp.mileage.toLocaleString('ru-RU')} км • Топливо: {insp.fuel_level}%
                      </p>
                    </div>
                  </div>
                  <Badge_1.Badge variant={insp.status === 'completed' ? 'emerald' : 'gray'} size="sm">
                    {insp.status === 'completed' ? 'Завершен' : 'В процессе'}
                  </Badge_1.Badge>
                </link_1.default>))}
            </div>)}
        </Card_1.Card>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map