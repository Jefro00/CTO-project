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
exports.default = LoginPage;
const react_1 = __importStar(require("react"));
const navigation_1 = require("next/navigation");
const auth_store_1 = require("../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Button_1 = require("../../components/ui/Button");
const Input_1 = require("../../components/ui/Input");
function LoginPage() {
    const router = (0, navigation_1.useRouter)();
    const { setAuth, api } = (0, auth_store_1.useAuthStore)();
    const [email, setEmail] = (0, react_1.useState)('advisor@example.local');
    const [password, setPassword] = (0, react_1.useState)('Password123!');
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const handleLogin = async (e) => {
        if (e)
            e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.login(email, password);
            if (res.data) {
                setAuth(res.data.accessToken, res.data.user);
                router.push('/dashboard');
            }
        }
        catch (err) {
            setError(err.message || 'Ошибка авторизации. Проверьте логин и пароль.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const quickSwitch = (accountEmail) => {
        setEmail(accountEmail);
        setPassword('Password123!');
    };
    const testAccounts = [
        { label: 'Мастер-приемщик', email: 'advisor@example.local', role: 'SERVICE_ADVISOR', icon: lucide_react_1.UserCheck, desc: 'Приемка, осмотр, фото/видео, заказ-наряды' },
        { label: 'Механик', email: 'mechanic@example.local', role: 'MECHANIC', icon: lucide_react_1.Wrench, desc: 'Выполнение назначенных работ и заказ-нарядов' },
        { label: 'Руководитель СТО', email: 'manager@example.local', role: 'BRANCH_MANAGER', icon: lucide_react_1.ShieldCheck, desc: 'Контроль филиала, аналитика и задачи' },
        { label: 'Владелец сети', email: 'owner@example.local', role: 'OWNER', icon: lucide_react_1.ShieldCheck, desc: 'Полный доступ, бэкапы, аудит' },
        { label: 'Документовед', email: 'documents@example.local', role: 'DOCUMENT_MANAGER', icon: lucide_react_1.FileText, desc: 'Акты, договоры, счета' },
        { label: 'Наблюдатель', email: 'viewer@example.local', role: 'VIEWER', icon: lucide_react_1.Eye, desc: 'Только чтение' },
    ];
    return (<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800/40">
        {/* Left Form Panel */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <lucide_react_1.Car className="w-6 h-6"/>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-wide">
                  AUTOMOTIVE <span className="text-indigo-600">OS</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">Multi-tenant SaaS система для СТО</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Вход в систему</h2>
              <p className="text-sm text-slate-500 mt-1">
                Введите учетные данные для доступа к автосервису
              </p>
            </div>

            {error && (<div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {error}
              </div>)}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input_1.Input label="Рабочий Email" type="email" icon={<lucide_react_1.Mail className="w-4 h-4"/>} value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.local"/>

              <Input_1.Input label="Пароль" type="password" icon={<lucide_react_1.Lock className="w-4 h-4"/>} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"/>

              <Button_1.Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2 font-bold py-3 text-base">
                <span>Войти в сервис</span>
                <lucide_react_1.ArrowRight className="w-4 h-4 ml-1"/>
              </Button_1.Button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Версия: 1.0.0-MVP</span>
            <span>JEFRO AUTO Systems</span>
          </div>
        </div>

        {/* Right Demo Accounts Picker */}
        <div className="lg:col-span-6 bg-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                Быстрый вход для тестирования
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                Pass: Password123!
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Выберите любую предопределенную роль (Section 90 ТЗ) для мгновенного входа:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {testAccounts.map((acc) => {
            const Icon = acc.icon;
            const isSelected = email === acc.email;
            return (<button key={acc.email} type="button" onClick={() => quickSwitch(acc.email)} className={`p-3 rounded-xl border text-left transition-all ${isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}/>
                        <span className="text-xs font-bold text-white">{acc.label}</span>
                      </div>
                      {isSelected && <lucide_react_1.CheckCircle2 className="w-3.5 h-3.5 text-indigo-400"/>}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">{acc.email}</p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{acc.desc}</p>
                  </button>);
        })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
            Центральный объект системы: <span className="text-sky-400 font-bold">VEHICLE (Цифровая история автомобиля)</span>
          </div>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map