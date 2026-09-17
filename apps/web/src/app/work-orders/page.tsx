'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../stores/auth.store';
import {
  Wrench,
  Plus,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Car,
  UserCheck,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { WorkOrder } from '@automotive-os/types';

export default function WorkOrdersPage() {
  const { api, user, can } = useAuthStore();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const isMechanic = user?.role?.name === 'MECHANIC' || (user?.role as any) === 'MECHANIC';
  const [statusFilter, setStatusFilter] = useState<string>(isMechanic ? 'my_assigned' : 'all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkOrders = async () => {
    setIsLoading(true);
    try {
      const queryParams: any = {
        search: search || undefined,
      };

      if (statusFilter === 'my_assigned') {
        if (user?.id) {
          queryParams.master_id = user.id;
          queryParams.assigned_to = user.id;
        }
      } else if (statusFilter !== 'all') {
        queryParams.status = statusFilter;
      }

      const res = await api.getWorkOrders(queryParams);
      let orders = res.data || [];

      // If in my_assigned mode and API filter returns empty or all, ensure client side filter matches user ID or role
      if (statusFilter === 'my_assigned' && user?.id) {
        orders = orders.filter((wo: any) =>
          wo.master_id === user.id ||
          wo.assigned_to === user.id ||
          wo.master?.id === user.id ||
          (wo.items && wo.items.some((it: any) => it.assigned_to === user.id)) ||
          wo.status === 'in_progress'
        );
      }

      setWorkOrders(orders);
    } catch (err) {
      console.error('Error loading work orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadWorkOrders, 200);
    return () => clearTimeout(timer);
  }, [statusFilter, search, user?.id]);

  const statuses = [
    { id: 'all', label: 'Все заказы' },
    { id: 'my_assigned', label: '⚡ Мои заказы (Цех)' },
    { id: 'in_progress', label: 'В работе' },
    { id: 'waiting_approval', label: 'Согласование' },
    { id: 'approved', label: 'Согласован' },
    { id: 'completed', label: 'Завершен' },
    { id: 'closed', label: 'Закрыт' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-7 h-7 text-indigo-600" /> Заказ-наряды
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Управление сервисными работами, запчастями, назначением механиков и актами
          </p>
        </div>
        {can('work_orders.create') && (
          <Link href="/inspections/new">
            <Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20">
              <Plus className="w-4 h-4" />
              <span>Новый заказ (через приемку)</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Filter and Status tabs */}
      <Card className="p-3 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Поиск по номеру заказа #, марке, модели, госномеру или клиенту..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statuses.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Загрузка заказ-нарядов...</div>
      ) : workOrders.length === 0 ? (
        <Card className="text-center py-16">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Заказ-наряды не найдены</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            {statusFilter === 'my_assigned'
              ? 'У вас пока нет назначенных заказов в цехе'
              : 'Создайте первый заказ-наряд через мастер приемки автомобиля'}
          </p>
          {can('work_orders.create') && (
            <Link href="/inspections/new">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4" /> Оформить приемку и заказ
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {workOrders.map((wo) => {
            const badgeVariants: Record<string, any> = {
              waiting_approval: 'amber',
              approved: 'indigo',
              in_progress: 'sky',
              completed: 'emerald',
              closed: 'gray',
            };
            const isAssignedToMe = wo.master_id === user?.id || (wo as any).master?.id === user?.id;

            return (
              <Link
                key={wo.id}
                href={`/work-orders/${wo.id}`}
                className="block bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-base font-black px-3 py-1.5 bg-slate-900 text-white rounded-xl shrink-0 group-hover:bg-indigo-600 transition-colors shadow-xs">
                      #{wo.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {wo.vehicle?.make} {wo.vehicle?.model}
                        </h3>
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {wo.vehicle?.license_plate}
                        </span>
                        {isAssignedToMe && (
                          <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Назначен вам
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Владелец: {wo.customer?.first_name} {wo.customer?.last_name} ({wo.customer?.phone}) • Приемщик: {wo.advisor?.first_name} {wo.advisor?.last_name}
                      </p>
                      {wo.master && (
                        <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                          🔧 Механик: {wo.master.first_name} {wo.master.last_name}
                        </p>
                      )}
                      {wo.customer_complaint && (
                        <p className="text-xs text-slate-600 mt-1 font-medium line-clamp-1">
                          Жалоба: {wo.customer_complaint}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0">
                    <div className="text-right mb-2">
                      <span className="text-base font-black text-slate-900 font-mono">
                        {wo.total.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {wo.items?.length || 0} поз. (работ и деталей)
                      </span>
                    </div>
                    <Badge variant={badgeVariants[wo.status] || 'gray'} size="sm">
                      {wo.status}
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
