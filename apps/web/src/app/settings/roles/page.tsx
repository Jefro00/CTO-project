'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/auth.store';
import { Settings, Shield, Check, X, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Role } from '@automotive-os/types';

export default function RolesSettingsPage() {
  const { api, can } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!can('roles.read')) {
      setIsLoading(false);
      return;
    }
    const loadRoles = async () => {
      try {
        const [rRes, pRes] = await Promise.all([
          api.getRoles(),
          api.request<any[]>('/permissions'),
        ]);
        setRoles(rRes.data || []);
        setPermissions(pRes.data || []);
      } catch (err) {
        console.error('Error fetching roles:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadRoles();
  }, [api, can]);

  if (!can('roles.read')) {
    return (
      <Card className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Доступ ограничен</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Для просмотра матрицы ролей и прав доступа требуются права администратора (roles.read).
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-600" /> Роли и матрица прав доступа
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Системные роли и гранулярные разрешения пользователей (Section 58 & 11-13)
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Загрузка матрицы прав...</div>
      ) : (
        <Card title="Матрица прав доступа по ролям (Section 58)">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase">
                  <th className="p-3">Код разрешения</th>
                  {roles.map((r) => (
                    <th key={r.id} className="p-3 text-center whitespace-nowrap">
                      {r.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-800">
                      {p.code}
                      {p.description && (
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          {p.description}
                        </span>
                      )}
                    </td>
                    {roles.map((r) => {
                      const hasPerm =
                        r.name === 'OWNER' ||
                        r.permissions?.some((rp: any) => rp.code === p.code || rp.code === '*');
                      return (
                        <td key={r.id} className="p-3 text-center">
                          {hasPerm ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-300">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
