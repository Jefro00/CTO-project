'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../stores/auth.store';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Car,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Customer } from '@automotive-os/types';

export default function CustomersPage() {
  const { api, can } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [newCust, setNewCust] = useState({
    first_name: '',
    last_name: '',
    phone: '+7 ',
    email: '',
    address: '',
    notes: '',
  });

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCustomers({ search });
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadCustomers, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCustomer(newCust);
      setIsCreateModalOpen(false);
      setNewCust({ first_name: '', last_name: '', phone: '+7 ', email: '', address: '', notes: '' });
      loadCustomers();
    } catch (err: any) {
      alert(err.message || 'Ошибка создания клиента');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" /> Клиентская база СТО
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Учет автовладельцев, контактных данных и привязанных транспортных средств
          </p>
        </div>
        {can('customers.create') && (
          <Button
            variant="primary"
            size="md"
            className="font-bold shadow-md shadow-indigo-600/20"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Добавить клиента</span>
          </Button>
        )}
      </div>

      <Card className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Поиск клиента по имени, фамилии, телефону или email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Загрузка клиентов...</div>
      ) : customers.length === 0 ? (
        <Card className="text-center py-16">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Клиенты не найдены</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Добавьте первого клиента в систему для оформления приемок
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4" /> Создать клиента
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="block bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    {c.first_name[0]}{c.last_name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {c.first_name} {c.last_name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Автомобилей:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-indigo-600" /> {c.vehicles?.length || 0} авто
                  </span>
                </div>
                {c.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-700 truncate max-w-[170px]">{c.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Профиль клиента</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Customer Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Добавление нового клиента"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Имя"
              placeholder="Иван"
              value={newCust.first_name}
              onChange={(e) => setNewCust({ ...newCust, first_name: e.target.value })}
              required
            />
            <Input
              label="Фамилия"
              placeholder="Петров"
              value={newCust.last_name}
              onChange={(e) => setNewCust({ ...newCust, last_name: e.target.value })}
              required
            />
          </div>

          <Input
            label="Номер телефона"
            placeholder="+7 (999) 000-00-00"
            value={newCust.phone}
            onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="client@example.com"
            value={newCust.email}
            onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
          />

          <Input
            label="Адрес проживания"
            placeholder="г. Москва, ул. Ленина, д. 1"
            value={newCust.address}
            onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
          />

          <Input
            label="Заметки"
            placeholder="Особые пожелания клиента..."
            value={newCust.notes}
            onChange={(e) => setNewCust({ ...newCust, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Сохранить клиента
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
