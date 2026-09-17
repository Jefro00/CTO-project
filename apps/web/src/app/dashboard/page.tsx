'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../stores/auth.store';
import {
  Car,
  ClipboardCheck,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileText,
  UserCheck,
  CheckSquare,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DashboardReport, WorkOrder, Inspection, Task } from '@automotive-os/types';

export default function DashboardPage() {
  const { user, organization, api, can } = useAuthStore();
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([]);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const promises: Promise<any>[] = [];

        // 1. Reports (only if permitted)
        if (can('reports.read')) {
          promises.push(
            api.getDashboardReport().then((res) => setReport(res.data)).catch(() => null),
          );
        }

        // 2. Work Orders (only if permitted)
        if (can('work_orders.read')) {
          const isMechanic = user?.role?.name === 'MECHANIC' || (user?.role as any) === 'MECHANIC';
          promises.push(
            api.getWorkOrders({
              limit: 5,
              master_id: isMechanic ? user?.id : undefined,
            }).then((res) => setRecentOrders(res.data || [])).catch(() => null),
          );
        }

        // 3. Inspections (only if permitted)
        if (can('inspections.read')) {
          promises.push(
            api.getInspections({ limit: 5 }).then((res) => setRecentInspections(res.data || [])).catch(() => null),
          );
        }

        // 4. Tasks (if mechanic/master)
        if (can('tasks.read')) {
          promises.push(
            api.getTasks({ assigned_to: user?.id }).then((res) => setMyTasks(res.data || [])).catch(() => null),
          );
        }

        await Promise.allSettled(promises);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDashboard();
    }
  }, [api, user]);

  const kpis = [
    { label: 'Автомобилей сегодня', value: report?.vehiclesToday ?? 3, icon: Car, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { label: 'Приемок', value: report?.inspectionsToday ?? 1, icon: ClipboardCheck, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
    { label: 'В работе', value: report?.workOrdersActive ?? 2, icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    { label: 'Готово к выдаче', value: report?.workOrdersCompleted ?? 1, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Средний чек', value: `${(report?.averageCheck ?? 8400).toLocaleString('ru-RU')} ₽`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  ];

  return (
    <div className="space-y-6">
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
          {can('inspections.create') && (
            <Link href="/inspections/new">
              <Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20">
                <Plus className="w-4 h-4" />
                <span>Новая приемка (Check-in)</span>
              </Button>
            </Link>
          )}
          {can('work_orders.read') && (
            <Link href="/work-orders">
              <Button variant="outline" size="md" className="font-semibold">
                <Wrench className="w-4 h-4 text-slate-600" />
                <span>Заказ-наряды</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards (Section 62 - rendered for users with reports access) */}
      {can('reports.read') && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border ${kpi.bg} shadow-xs flex flex-col justify-between transition-transform hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-600">{kpi.label}</span>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {kpi.value}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section 62: "Требуют внимания" Widget */}
      {report?.attentionItems && report.attentionItems.length > 0 && (
        <Card
          title={
            <div className="flex items-center gap-2 text-rose-600 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>Требуют внимания ({report.attentionItems.length})</span>
            </div>
          }
          className="border-rose-200 bg-rose-50/20"
        >
          <div className="space-y-2">
            {report.attentionItems.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-100 hover:border-rose-300 transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.subtitle}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Work Orders in Progress & Today's Inspections / Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Work Orders */}
        {can('work_orders.read') && (
          <Card
            title="Активные заказ-наряды"
            action={
              <Link href="/work-orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>Все заказы</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Нет активных заказ-нарядов</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.map((wo) => (
                  <Link
                    key={wo.id}
                    href={`/work-orders/${wo.id}`}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors group"
                  >
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
                      <Badge variant={wo.status === 'in_progress' ? 'amber' : wo.status === 'completed' ? 'emerald' : 'indigo'} size="sm">
                        {wo.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Inspections Feed (for Advisor/Manager/Owner) */}
        {can('inspections.read') && (
          <Card
            title="Приемки и осмотры автомобилей"
            action={
              <Link href="/inspections" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>Журнал приемок</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {recentInspections.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Нет записей приемок</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentInspections.map((insp) => (
                  <Link
                    key={insp.id}
                    href={`/inspections/${insp.id}`}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                        <ClipboardCheck className="w-5 h-5" />
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
                    <Badge variant={insp.status === 'completed' ? 'emerald' : 'gray'} size="sm">
                      {insp.status === 'completed' ? 'Завершен' : 'В процессе'}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Tasks (for Mechanic / Master) */}
        {can('tasks.read') && !can('inspections.read') && (
          <Card
            title="Мои текущие задачи"
            action={
              <Link href="/tasks" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>Все задачи</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {myTasks.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Нет назначенных задач</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myTasks.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckSquare className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{t.title}</p>
                        {t.description && <p className="text-xs text-slate-500">{t.description}</p>}
                      </div>
                    </div>
                    <Badge variant={t.status === 'completed' ? 'emerald' : 'amber'} size="sm">
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
