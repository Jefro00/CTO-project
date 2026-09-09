"use strict";
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
exports.MobileSimulatorWrapper = void 0;
const react_1 = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const clsx_1 = require("clsx");
const auth_store_1 = require("../../stores/auth.store");
const MobileSimulatorWrapper = ({ children }) => {
    const pathname = (0, navigation_1.usePathname)();
    const router = (0, navigation_1.useRouter)();
    const { user, organization } = (0, auth_store_1.useAuthStore)();
    const [isFabOpen, setIsFabOpen] = (0, react_1.useState)(false);
    const navItems = [
        { label: 'Главная', href: '/dashboard', icon: lucide_react_1.Home },
        { label: 'Авто', href: '/vehicles', icon: lucide_react_1.Car },
        { label: 'Заказы', href: '/work-orders', icon: lucide_react_1.Wrench },
        { label: 'Задачи', href: '/tasks', icon: lucide_react_1.CheckSquare },
        { label: 'Профиль', href: '/settings/users', icon: lucide_react_1.User },
    ];
    return (<div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Smartphone Frame Mockup */}
      <div className="w-full max-w-[420px] h-[840px] bg-slate-950 rounded-[44px] p-3.5 shadow-2xl border-4 border-slate-700 relative flex flex-col overflow-hidden">
        {/* Phone Notch / Dynamic Island */}
        <div className="w-32 h-5 bg-black rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800 ml-auto mr-3"/>
        </div>

        {/* Screen Viewport */}
        <div className="flex-1 bg-slate-50 rounded-[32px] overflow-hidden flex flex-col relative shadow-inner">
          {/* Mobile Top Bar */}
          <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs tracking-wider text-slate-900">
                AUTOMOTIVE <span className="text-sky-600">OS</span>
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
              {user?.role?.name || 'SERVICE_ADVISOR'}
            </span>
          </div>

          {/* Main Mobile App Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 pb-24">{children}</div>

          {/* Floating Action Menu (Section 69: Floating action +) */}
          {isFabOpen && (<div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-40 flex flex-col justify-end p-4 pb-20 space-y-2 animate-fadeIn" onClick={() => setIsFabOpen(false)}>
              <div className="bg-white rounded-2xl p-3 shadow-2xl border border-slate-200 space-y-2">
                <link_1.default href="/inspections/new" onClick={() => setIsFabOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm hover:bg-indigo-100 transition-colors">
                  <lucide_react_1.ClipboardCheck className="w-5 h-5 text-indigo-600"/>
                  <span>Новая приемка автомобиля</span>
                </link_1.default>
                <link_1.default href="/vehicles" onClick={() => setIsFabOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-800 font-medium text-sm transition-colors">
                  <lucide_react_1.Car className="w-5 h-5 text-slate-600"/>
                  <span>Новый автомобиль</span>
                </link_1.default>
                <link_1.default href="/inspections" onClick={() => setIsFabOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-800 font-medium text-sm transition-colors">
                  <lucide_react_1.Camera className="w-5 h-5 text-slate-600"/>
                  <span>Сделать фото</span>
                </link_1.default>
                <link_1.default href="/inspections" onClick={() => setIsFabOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-800 font-medium text-sm transition-colors">
                  <lucide_react_1.Video className="w-5 h-5 text-slate-600"/>
                  <span>Снять видео осмотра</span>
                </link_1.default>
                <link_1.default href="/tasks" onClick={() => setIsFabOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-800 font-medium text-sm transition-colors">
                  <lucide_react_1.CheckSquare className="w-5 h-5 text-slate-600"/>
                  <span>Создать задачу</span>
                </link_1.default>
              </div>
            </div>)}

          {/* Floating Action Button (+) */}
          <button onClick={() => setIsFabOpen(!isFabOpen)} className="absolute right-4 bottom-20 z-50 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform active:scale-95" title="Быстрое действие">
            {isFabOpen ? <lucide_react_1.X className="w-6 h-6"/> : <lucide_react_1.Plus className="w-6 h-6"/>}
          </button>

          {/* Bottom Navigation (Section 69) */}
          <nav className="h-16 bg-white border-t border-slate-200 px-3 flex items-center justify-around shrink-0 absolute bottom-0 inset-x-0 z-30">
            {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (<link_1.default key={item.href} href={item.href} className={(0, clsx_1.clsx)('flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors', isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium')}>
                  <Icon className="w-5 h-5"/>
                  <span className="text-[10px]">{item.label}</span>
                </link_1.default>);
        })}
          </nav>
        </div>
      </div>
    </div>);
};
exports.MobileSimulatorWrapper = MobileSimulatorWrapper;
//# sourceMappingURL=MobileSimulatorWrapper.js.map