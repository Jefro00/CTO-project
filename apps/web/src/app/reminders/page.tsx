'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import {
  BellRing,
  Plus,
  Car,
  Calendar,
  Gauge,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Reminder, Vehicle } from '@automotive-os/types';

export default function RemindersPage() {
  const { api, currentLocation } = useAuthStore();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newRem, setNewRem] = useState({
    vehicle_id: '',
    title: '',
    description: '',
    target_mileage: 152300,
    target_date: '',
    type: 'mileage',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rRes, vRes] = await Promise.all([
        api.getReminders(),
        api.getVehicles({ limit: 100 }),
      ]);
      setReminders(rRes.data || []);
      setVehicles(vRes.data || []);
      if (vRes.data && vRes.data.length > 0 && !newRem.vehicle_id) {
        setNewRem((prev) => ({ ...prev, vehicle_id: vRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching reminders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === newRem.vehicle_id);
    if (!veh) return;

    try {
      await api.createReminder({
        ...newRem,
        customer_id: veh.customer_id,
        location_id: currentLocation?.id,
        target_mileage: Number(newRem.target_mileage) || null,
        target_date: newRem.target_date || null,
      });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Ошибка создания напоминания');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.completeReminder(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Ошибка');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BellRing className="w-7 h-7 text-indigo-600" /> Напоминания о ТО
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Контроль сервисных интервалов по пробегу и датам (Section 48 & 24)
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="font-bold shadow-md shadow-indigo-600/20"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Создать напоминание</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Загрузка напоминаний...</div>
      ) : reminders.length === 0 ? (
        <Card className="text-center py-16">
          <BellRing className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Напоминаний пока нет</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Добавьте напоминание о плановом ТО, замене тормозных колодок или сезонном шиномонтаже
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" /> Добавить напоминание
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((rem) => (
            <Card key={rem.id} className="hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <Badge variant={rem.status === 'completed' ? 'emerald' : 'amber'} size="sm">
                    {rem.status}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{rem.title}</h3>
                {rem.description && (
                  <p className="text-xs text-slate-500 mt-1">{rem.description}</p>
                )}

                <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1 text-xs">
                  {rem.target_mileage && (
                    <p className="font-mono text-slate-800 font-bold flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                      Целевой пробег: {rem.target_mileage.toLocaleString('ru-RU')} км
                    </p>
                  )}
                  {rem.target_date && (
                    <p className="text-slate-600 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Дата: {new Date(rem.target_date).toLocaleDateString('ru-RU')}
                    </p>
                  )}
                  {rem.vehicle && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Car className="w-3 h-3 text-slate-400" />
                      {rem.vehicle.make} {rem.vehicle.model} ({rem.vehicle.license_plate})
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                {rem.status !== 'completed' && (
                  <Button variant="outline" size="sm" onClick={() => handleComplete(rem.id)}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    Выполнено
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Новое сервисное напоминание"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Автомобиль"
            value={newRem.vehicle_id}
            onChange={(e) => setNewRem({ ...newRem, vehicle_id: e.target.value })}
            options={vehicles.map((v) => ({
              value: v.id,
              label: `${v.make} ${v.model} (${v.license_plate})`,
            }))}
            required
          />

          <Input
            label="Название напоминания"
            placeholder="например: Плановое ТО через 10 000 км"
            value={newRem.title}
            onChange={(e) => setNewRem({ ...newRem, title: e.target.value })}
            required
          />

          <Input
            label="Описание работ"
            placeholder="Замена масла ДВС, фильтров и свечей..."
            value={newRem.description}
            onChange={(e) => setNewRem({ ...newRem, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Целевой пробег (км)"
              type="number"
              value={newRem.target_mileage}
              onChange={(e) => setNewRem({ ...newRem, target_mileage: Number(e.target.value) })}
            />
            <Input
              label="Целевая дата"
              type="date"
              value={newRem.target_date}
              onChange={(e) => setNewRem({ ...newRem, target_date: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Сохранить
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
