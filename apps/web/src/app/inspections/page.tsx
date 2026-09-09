'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../stores/auth.store';
import {
  ClipboardCheck,
  Plus,
  Search,
  ChevronRight,
  Car,
  User,
  Calendar,
  Gauge,
  Fuel,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Inspection } from '@automotive-os/types';

export default function InspectionsPage() {
  const { api } = useAuthStore();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const res = await api.getInspections({ limit: 50 });
        setInspections(res.data || []);
      } catch (err) {
        console.error('Error fetching inspections:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInspections();
  }, [api]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-indigo-600" /> Журнал приемок и осмотров
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Фиксация состояния кузова, салона, пробега, топлива и повреждений при въезде на СТО
          </p>
        </div>
        <Link href="/inspections/new">
          <Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20">
            <Plus className="w-4 h-4" />
            <span>Новая приемка</span>
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Загрузка приемок...</div>
      ) : inspections.length === 0 ? (
        <Card className="text-center py-16">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Приемок пока нет</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Оформите первую приемку автомобиля для начала обслуживания
          </p>
          <Link href="/inspections/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" /> Создать приемку
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {inspections.map((insp) => (
            <Card
              key={insp.id}
              className="p-5 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <ClipboardCheck className="w-6 h-6" />
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
                  <Badge variant={insp.status === 'completed' ? 'emerald' : 'gray'} size="sm">
                    {insp.status === 'completed' ? 'Завершен' : 'В процессе'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
