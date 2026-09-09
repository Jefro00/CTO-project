'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/auth.store';
import {
  Shield,
  Plus,
  Mail,
  User,
  MapPin,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { User as UserType, Role, Location } from '@automotive-os/types';

export default function UsersSettingsPage() {
  const { api, user } = useAuthStore();
  const [users, setUsers] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: 'Password123!',
    role_id: '',
    location_id: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [uRes, rRes, lRes] = await Promise.all([
        api.request<UserType[]>('/users'),
        api.request<Role[]>('/roles'),
        api.getLocations(),
      ]);
      setUsers(uRes.data || []);
      setRoles(rRes.data || []);
      setLocations(lRes.data || []);
      if (rRes.data && rRes.data.length > 0 && !newUser.role_id) {
        setNewUser((prev) => ({ ...prev, role_id: rRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.request('/users', {
        method: 'POST',
        body: JSON.stringify({
          ...newUser,
          location_id: newUser.location_id || null,
        }),
      });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Ошибка создания пользователя');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-600" /> Управление сотрудниками
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Список учетных записей, привязка к филиалам и назначение ролей (Section 35 & 10)
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="font-bold shadow-md shadow-indigo-600/20"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Добавить сотрудника</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Загрузка пользователей...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u: any) => (
            <Card key={u.id} className="hover:border-indigo-300 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                  {u.first_name?.[0]}{u.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {u.first_name} {u.last_name}
                    </h3>
                    <Badge variant={u.role_name === 'OWNER' ? 'purple' : 'indigo'} size="sm">
                      {u.role_name}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{u.email}</p>
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    Филиал: {u.location_name || 'Все филиалы (Global Scope)'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Создание новой учетной записи"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Имя"
              value={newUser.first_name}
              onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
              required
            />
            <Input
              label="Фамилия"
              value={newUser.last_name}
              onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />

          <Input
            label="Пароль"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />

          <Select
            label="Системная роль"
            value={newUser.role_id}
            onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
            options={roles.map((r) => ({
              value: r.id,
              label: `${r.name} (${r.description || ''})`,
            }))}
            required
          />

          <Select
            label="Филиал (Location Scope)"
            value={newUser.location_id}
            onChange={(e) => setNewUser({ ...newUser, location_id: e.target.value })}
            options={[
              { value: '', label: 'Все филиалы организации (Network Scope)' },
              ...locations.map((l) => ({ value: l.id, label: l.name })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Создать
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
