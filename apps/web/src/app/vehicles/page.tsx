'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../stores/auth.store';
import {
  Car,
  Search,
  Plus,
  Filter,
  ArrowRight,
  ChevronRight,
  User,
  Hash,
  Gauge,
  Calendar,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Vehicle, Customer } from '@automotive-os/types';

export default function VehiclesPage() {
  const { api } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New vehicle form
  const [newVeh, setNewVeh] = useState({
    customer_id: '',
    make: '',
    model: '',
    generation: '',
    year: new Date().getFullYear(),
    color: '',
    vin: '',
    license_plate: '',
    mileage: 0,
    engine: '',
    transmission: 'АКПП',
    drive_type: 'Полный',
    fuel_type: 'Бензин',
    notes: '',
  });

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const [vRes, cRes] = await Promise.all([
        api.getVehicles({ search }),
        api.getCustomers({ limit: 100 }),
      ]);
      setVehicles(vRes.data || []);
      setCustomers(cRes.data || []);
      if (cRes.data && cRes.data.length > 0 && !newVeh.customer_id) {
        setNewVeh((prev) => ({ ...prev, customer_id: cRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadVehicles, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createVehicle(newVeh);
      setIsCreateModalOpen(false);
      loadVehicles();
    } catch (err: any) {
      alert(err.message || 'Ошибка создания автомобиля');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Car className="w-7 h-7 text-indigo-600" /> База автомобилей
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Реестр транспортных средств с полной цифровой историей обслуживания
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="font-bold shadow-md shadow-indigo-600/20"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Добавить автомобиль</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Поиск по марке, модели, VIN, госномеру или имени владельца..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Card>

      {/* Vehicles Grid / Table */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Загрузка автомобилей...</div>
      ) : vehicles.length === 0 ? (
        <Card className="text-center py-16">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Автомобили не найдены</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            В базе пока нет автомобилей или запрос поиска не дал результатов
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4" /> Добавить первый автомобиль
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <Link
              key={v.id}
              href={`/vehicles/${v.id}`}
              className="block group bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {v.make} {v.model}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {v.year} г.в. • {v.color || 'Цвет не указан'}
                  </p>
                </div>
                <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                  {v.license_plate}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">VIN:</span>
                  <span className="font-mono font-semibold text-slate-800">{v.vin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Владелец:</span>
                  <span className="font-semibold text-slate-800">
                    {v.customer?.first_name} {v.customer?.last_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Текущий пробег:</span>
                  <span className="font-bold text-indigo-600 font-mono">
                    {v.mileage.toLocaleString('ru-RU')} км
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Открыть историю авто</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Vehicle Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Регистрация нового автомобиля"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateVehicle} className="space-y-4">
          <Select
            label="Владелец (Клиент)"
            value={newVeh.customer_id}
            onChange={(e) => setNewVeh({ ...newVeh, customer_id: e.target.value })}
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.first_name} ${c.last_name} (${c.phone})`,
            }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Марка"
              placeholder="например: BMW"
              value={newVeh.make}
              onChange={(e) => setNewVeh({ ...newVeh, make: e.target.value })}
              required
            />
            <Input
              label="Модель"
              placeholder="например: X5"
              value={newVeh.model}
              onChange={(e) => setNewVeh({ ...newVeh, model: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Госномер"
              placeholder="A123AA77"
              value={newVeh.license_plate}
              onChange={(e) => setNewVeh({ ...newVeh, license_plate: e.target.value })}
              required
            />
            <Input
              label="VIN код"
              placeholder="WBA..."
              value={newVeh.vin}
              onChange={(e) => setNewVeh({ ...newVeh, vin: e.target.value })}
              required
            />
            <Input
              label="Год выпуска"
              type="number"
              value={newVeh.year}
              onChange={(e) => setNewVeh({ ...newVeh, year: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Текущий пробег (км)"
              type="number"
              value={newVeh.mileage}
              onChange={(e) => setNewVeh({ ...newVeh, mileage: Number(e.target.value) })}
              required
            />
            <Input
              label="Цвет кузова"
              placeholder="Черный металлик"
              value={newVeh.color}
              onChange={(e) => setNewVeh({ ...newVeh, color: e.target.value })}
            />
            <Input
              label="Двигатель / Мощность"
              placeholder="3.0 л / 249 л.с."
              value={newVeh.engine}
              onChange={(e) => setNewVeh({ ...newVeh, engine: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Сохранить автомобиль
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
