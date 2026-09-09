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
exports.default = InspectionsPage;
const react_1 = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
const auth_store_1 = require("../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../components/ui/Card");
const Button_1 = require("../../components/ui/Button");
const Badge_1 = require("../../components/ui/Badge");
function InspectionsPage() {
    const { api } = (0, auth_store_1.useAuthStore)();
    const [inspections, setInspections] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const fetchInspections = async () => {
            try {
                const res = await api.getInspections({ limit: 50 });
                setInspections(res.data || []);
            }
            catch (err) {
                console.error('Error fetching inspections:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchInspections();
    }, [api]);
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <lucide_react_1.ClipboardCheck className="w-7 h-7 text-indigo-600"/> Журнал приемок и осмотров
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Фиксация состояния кузова, салона, пробега, топлива и повреждений при въезде на СТО
          </p>
        </div>
        <link_1.default href="/inspections/new">
          <Button_1.Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20">
            <lucide_react_1.Plus className="w-4 h-4"/>
            <span>Новая приемка</span>
          </Button_1.Button>
        </link_1.default>
      </div>

      {isLoading ? (<div className="text-center py-12 text-slate-500 text-sm">Загрузка приемок...</div>) : inspections.length === 0 ? (<Card_1.Card className="text-center py-16">
          <lucide_react_1.ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
          <h3 className="text-base font-bold text-slate-800">Приемок пока нет</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Оформите первую приемку автомобиля для начала обслуживания
          </p>
          <link_1.default href="/inspections/new">
            <Button_1.Button variant="primary" size="sm">
              <lucide_react_1.Plus className="w-4 h-4"/> Создать приемку
            </Button_1.Button>
          </link_1.default>
        </Card_1.Card>) : (<div className="space-y-3">
          {inspections.map((insp) => (<Card_1.Card key={insp.id} className="p-5 hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <lucide_react_1.ClipboardCheck className="w-6 h-6"/>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {insp.vehicle?.make} {insp.vehicle?.model}
                      </h3>
                      <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                        {insp.vehicle?.license_plate}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      VIN: {insp.vehicle?.vin} • Владелец: {insp.customer?.first_name} {insp.customer?.last_name} ({insp.customer?.phone})
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {insp.customer_comment || 'Первичный осмотр'}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0">
                  <div className="text-right mb-2">
                    <span className="text-xs font-bold text-indigo-600 font-mono">
                      {insp.mileage.toLocaleString('ru-RU')} км
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Топливо: {insp.fuel_level}%
                    </span>
                  </div>
                  <Badge_1.Badge variant={insp.status === 'completed' ? 'emerald' : 'gray'} size="sm">
                    {insp.status === 'completed' ? 'Завершен' : 'В процессе'}
                  </Badge_1.Badge>
                </div>
              </div>
            </Card_1.Card>))}
        </div>)}
    </div>);
}
//# sourceMappingURL=page.js.map