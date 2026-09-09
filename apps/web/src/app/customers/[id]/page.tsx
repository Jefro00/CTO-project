'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../stores/auth.store';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Wrench,
  Plus,
  ArrowLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Customer, Vehicle, WorkOrder } from '@automotive-os/types';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;
  const { api } = useAuthStore();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    const loadCustomer = async () => {
      setIsLoading(true);
      try {
        const res = await api.getCustomer(customerId);
        setCustomer(res.data);
        setVehicles(res.data.vehicles || []);
        setWorkOrders((res.data as any).workOrders || []);
      } catch (err) {
        console.error('Error fetching customer:', err);
      } finally {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {customer.first_name} {customer.last_name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Карточка постоянного клиента автосервиса</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Контактная информация" className="md:col-span-1">
          <div className="space-y-3 text-xs text-slate-700">
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-600" />
              <strong>{customer.phone}</strong>
            </p>
            {customer.email && (
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{customer.email}</span>
              </p>
            )}
            {customer.address && (
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{customer.address}</span>
              </p>
            )}
            {customer.notes && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400">Примечания:</span>
                <p className="italic text-slate-600 mt-0.5">{customer.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Vehicles */}
        <Card
          title={`Автомобили клиента (${vehicles.length})`}
          className="md:col-span-2"
          action={
            <Link href="/vehicles">
              <Button size="sm" variant="outline">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Привязать авто
              </Button>
            </Link>
          }
        >
          {vehicles.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">У клиента пока нет привязанных авто</div>
          ) : (
            <div className="space-y-2">
              {vehicles.map((v) => (
                <Link
                  key={v.id}
                  href={`/vehicles/${v.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                        {v.make} {v.model} ({v.year})
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Госномер: {v.license_plate} • Пробег: {v.mileage.toLocaleString('ru-RU')} км
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Orders */}
      <Card title="История обращений и заказ-нарядов">
        {workOrders.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">Нет выполненных заказов</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {workOrders.map((wo) => (
              <Link
                key={wo.id}
                href={`/work-orders/${wo.id}`}
                className="py-3 flex items-center justify-between hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">Заказ-наряд #{wo.number}</p>
                  <p className="text-xs text-slate-500">
                    Дата: {new Date(wo.opened_at).toLocaleDateString('ru-RU')} • Статус: {wo.status}
                  </p>
                </div>
                <div className="text-right font-mono font-bold text-indigo-600">
                  {wo.total.toLocaleString('ru-RU')} ₽
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
