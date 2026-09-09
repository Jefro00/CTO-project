"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sidebar = void 0;
const react_1 = __importDefault(require("react"));
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const clsx_1 = require("clsx");
const auth_store_1 = require("../../stores/auth.store");
const Sidebar = () => {
    const pathname = (0, navigation_1.usePathname)();
    const { user, organization, currentLocation, can } = (0, auth_store_1.useAuthStore)();
    const navItems = [
        { label: 'Дашборд', href: '/dashboard', icon: lucide_react_1.LayoutDashboard },
        { label: 'Клиенты', href: '/customers', icon: lucide_react_1.Users, permission: 'customers.read' },
        { label: 'Автомобили', href: '/vehicles', icon: lucide_react_1.Car, permission: 'vehicles.read' },
        { label: 'Приемка / Осмотр', href: '/inspections', icon: lucide_react_1.ClipboardCheck, permission: 'inspections.read' },
        { label: 'Заказ-наряды', href: '/work-orders', icon: lucide_react_1.Wrench, permission: 'work_orders.read' },
        { label: 'Документы и акты', href: '/documents', icon: lucide_react_1.FileText, permission: 'documents.read' },
        { label: 'Задачи цеха', href: '/tasks', icon: lucide_react_1.CheckSquare, permission: 'tasks.read' },
        { label: 'Напоминания ТО', href: '/reminders', icon: lucide_react_1.BellRing, permission: 'reminders.read' },
        { label: 'Аналитика и отчеты', href: '/reports', icon: lucide_react_1.BarChart3, permission: 'reports.read' },
    ];
    const settingsItems = [
        { label: 'Сотрудники', href: '/settings/users', icon: lucide_react_1.Shield, permission: 'users.read' },
        { label: 'Роли и доступы', href: '/settings/roles', icon: lucide_react_1.Settings, permission: 'roles.read' },
        { label: 'Филиалы СТО', href: '/settings/locations', icon: lucide_react_1.MapPin, permission: 'locations.read' },
    ];
    const filteredNav = navItems.filter((i) => !i.permission || can(i.permission));
    const filteredSettings = settingsItems.filter((i) => !i.permission || can(i.permission));
    return (<aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <lucide_react_1.Car className="w-5 h-5"/>
          </div>
          <div>
            <h1 className="font-black text-base text-white tracking-wider flex items-center gap-1.5">
              AUTOMOTIVE <span className="text-sky-400 text-xs px-1.5 py-0.5 bg-sky-950/80 rounded border border-sky-800">OS</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold truncate max-w-[130px]">
              {organization?.name || 'JEFRO AUTO'}
            </p>
          </div>
        </div>
      </div>

      {/* Branch / Location indicator */}
      {currentLocation && (<div className="px-5 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <lucide_react_1.MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0"/>
          <span className="truncate font-medium text-slate-300">{currentLocation.name}</span>
        </div>)}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Операционная работа
          </div>
          <nav className="space-y-1">
            {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (<link_1.default key={item.href} href={item.href} className={(0, clsx_1.clsx)('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group', isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60')}>
                  <Icon className={(0, clsx_1.clsx)('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')}/>
                  <span>{item.label}</span>
                </link_1.default>);
        })}
          </nav>
        </div>

        {filteredSettings.length > 0 && (<div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
              Управление и настройки
            </div>
            <nav className="space-y-1">
              {filteredSettings.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href);
                return (<link_1.default key={item.href} href={item.href} className={(0, clsx_1.clsx)('flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group', isActive
                        ? 'bg-slate-800 text-sky-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40')}>
                    <Icon className="w-3.5 h-3.5 shrink-0"/>
                    <span>{item.label}</span>
                  </link_1.default>);
            })}
            </nav>
          </div>)}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
            {user?.first_name?.[0]}
            {user?.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[10px] text-sky-400 font-mono uppercase truncate">
              {user?.role?.name || 'USER'}
            </p>
          </div>
        </div>
      </div>
    </aside>);
};
exports.Sidebar = Sidebar;
//# sourceMappingURL=Sidebar.js.map