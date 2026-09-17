import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardCheck,
  Wrench,
  FileText,
  CheckSquare,
  BellRing,
  BarChart3,
  Settings,
  Shield,
  MapPin,
  Building2,
  HardDriveDownload,
  FileSpreadsheet,
  LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../stores/auth.store';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, organization, currentLocation, can, logout } = useAuthStore();

  const navItems = [
    { label: 'Дашборд', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Клиенты', href: '/customers', icon: Users, permission: 'customers.read' },
    { label: 'Автомобили', href: '/vehicles', icon: Car, permission: 'vehicles.read' },
    { label: 'Приемка / Осмотр', href: '/inspections', icon: ClipboardCheck, permission: 'inspections.read' },
    { label: 'Заказ-наряды', href: '/work-orders', icon: Wrench, permission: 'work_orders.read' },
    { label: 'Документы и акты', href: '/documents', icon: FileText, permission: 'documents.read' },
    { label: 'Задачи цеха', href: '/tasks', icon: CheckSquare, permission: 'tasks.read' },
    { label: 'Напоминания ТО', href: '/reminders', icon: BellRing, permission: 'reminders.read' },
    { label: 'Аналитика и отчеты', href: '/reports', icon: BarChart3, permission: 'reports.read' },
  ];

  const settingsItems = [
    { label: 'Сотрудники', href: '/settings/users', icon: Shield, permission: 'users.read' },
    { label: 'Роли и доступы', href: '/settings/roles', icon: Settings, permission: 'roles.read' },
    { label: 'Филиалы СТО', href: '/settings/locations', icon: MapPin, permission: 'locations.read' },
  ];

  const filteredNav = navItems.filter((i) => !i.permission || can(i.permission));
  const filteredSettings = settingsItems.filter((i) => !i.permission || can(i.permission));

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Car className="w-5 h-5" />
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
      {currentLocation && (
        <div className="px-5 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="truncate font-medium text-slate-300">{currentLocation.name}</span>
        </div>
      )}

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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60',
                  )}
                >
                  <Icon className={clsx('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {filteredSettings.length > 0 && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
              Управление и настройки
            </div>
            <nav className="space-y-1">
              {filteredSettings.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group',
                      isActive
                        ? 'bg-slate-800 text-sky-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40',
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User Profile & Logout Footer (BUG-12 fix) */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] text-sky-400 font-mono uppercase truncate">
                {user?.role?.name || (user?.role as any) || 'USER'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Выйти из системы"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
