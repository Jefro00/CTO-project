'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import {
  BarChart3,
  TrendingUp,
  Car,
  Wrench,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

export default function ReportsPage() {
  const { api } = useAuthStore();
  const [vehiclesReport, setVehiclesReport] = useState<any>(null);
  const [ordersReport, setOrdersReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [vRes, oRes] = await Promise.all([
          api.request<any>('/reports/vehicles'),
          api.request<any>('/reports/work-orders'),
        ]);
        setVehiclesReport(vRes.data);
        setOrdersReport(oRes.data);
      } catch (err) {
        console.error('Error loading reports:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, [api]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-indigo-600" /> Аналитика и статистика автосервиса
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Базовые операционные и финансовые показатели СТО (Section 53 & 89)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-indigo-50 border-indigo-100">
          <span className="text-xs font-bold text-indigo-600 uppercase">Всего автомобилей в базе</span>
          <p className="text-3xl font-black text-indigo-950 mt-1 font-mono">
            {vehiclesReport?.totalVehicles ?? 3}
          </p>
        </Card>

        <Card className="p-5 bg-sky-50 border-sky-100">
          <span className="text-xs font-bold text-sky-600 uppercase">Всего заказов</span>
          <p className="text-3xl font-black text-sky-950 mt-1 font-mono">
            {ordersReport?.totalOrders ?? 3}
          </p>
        </Card>

        <Card className="p-5 bg-emerald-50 border-emerald-100">
          <span className="text-xs font-bold text-emerald-600 uppercase">Общая выручка</span>
          <p className="text-3xl font-black text-emerald-950 mt-1 font-mono">
            {(ordersReport?.totalRevenue ?? 30000).toLocaleString('ru-RU')} ₽
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Распределение автопарка по маркам">
          <div className="space-y-3">
            {vehiclesReport?.byMake?.map((item: any) => (
              <div key={item.make} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-bold text-slate-900">{item.make}</span>
                <span className="font-mono text-xs font-bold bg-slate-200 px-2.5 py-1 rounded-md text-slate-800">
                  {item.count} авто
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Заказ-наряды по статусам">
          <div className="space-y-3">
            {ordersReport?.byStatus?.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-bold text-slate-900 uppercase text-xs">{item.status}</span>
                <span className="font-mono text-xs font-bold bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-md">
                  {item.count} заказов
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
