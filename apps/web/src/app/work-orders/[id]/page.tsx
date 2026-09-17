'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../stores/auth.store';
import {
  Wrench,
  Car,
  User,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Trash2,
  Clock,
  Play,
  Check,
  XCircle,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { WorkOrder, WorkOrderItem, User as UserType } from '@automotive-os/types';

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workOrderId = params?.id as string;
  const { api, user, currentLocation, can } = useAuthStore();

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [mechanics, setMechanics] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Transfer / Assign Mechanic Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMechanicId, setSelectedMechanicId] = useState('');

  // Add Item Modal
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'labor',
    description: '',
    quantity: 1,
    unit_price: 1500,
    cost_price: 0,
    assigned_to: '',
  });

  const loadWorkOrder = async () => {
    setIsLoading(true);
    try {
      const woRes = await api.getWorkOrder(workOrderId);
      setWorkOrder(woRes.data);

      try {
        const uRes = await api.getUsers();
        const allUsers = uRes.data || [];
        const mechList = allUsers.filter(
          (u: any) => u.role_name === 'MECHANIC' || u.role?.name === 'MECHANIC' || u.role === 'MECHANIC',
        );
        const resolvedMechanics = mechList.length > 0 ? mechList : [
          { id: 'usr-mechanic-1', first_name: 'Алексей', last_name: 'Ключевский', email: 'mechanic@example.local' } as any,
        ];
        setMechanics(resolvedMechanics);
        if (resolvedMechanics.length > 0 && !selectedMechanicId) {
          setSelectedMechanicId(resolvedMechanics[0].id);
        }
      } catch {
        // Fallback mechanics list for roles without users.read
        const fallback = [
          { id: 'usr-mechanic-1', first_name: 'Алексей', last_name: 'Ключевский', email: 'mechanic@example.local' } as any,
        ];
        setMechanics(fallback);
        if (!selectedMechanicId) {
          setSelectedMechanicId(fallback[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching work order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (workOrderId) loadWorkOrder();
  }, [workOrderId]);

  const handleStatusChange = async (action: 'approve' | 'start' | 'complete' | 'close') => {
    try {
      if (action === 'approve') await api.approveWorkOrder(workOrderId);
      if (action === 'start') {
        setIsAssignModalOpen(true);
        return;
      }
      if (action === 'complete') await api.completeWorkOrder(workOrderId);
      if (action === 'close') await api.closeWorkOrder(workOrderId);
      loadWorkOrder();
    } catch (err: any) {
      alert(err.message || 'Ошибка изменения статуса');
    }
  };

  const handleConfirmTransferToWorkshop = async () => {
    try {
      await api.startWorkOrder(workOrderId, selectedMechanicId || undefined);
      setIsAssignModalOpen(false);
      loadWorkOrder();
    } catch (err: any) {
      alert(err.message || 'Ошибка передачи в цех');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addWorkOrderItem(workOrderId, {
        ...newItem,
        quantity: Number(newItem.quantity),
        unit_price: Number(newItem.unit_price),
        cost_price: Number(newItem.cost_price) || null,
        assigned_to: newItem.assigned_to || null,
      });
      setIsAddItemModalOpen(false);
      setNewItem({
        type: 'labor',
        description: '',
        quantity: 1,
        unit_price: 1500,
        cost_price: 0,
        assigned_to: '',
      });
      loadWorkOrder();
    } catch (err: any) {
      alert(err.message || 'Ошибка добавления позиции');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.request(`/work-orders/${workOrderId}/items/${itemId}`, { method: 'DELETE' });
      loadWorkOrder();
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления');
    }
  };

  const handleToggleItemStatus = async (item: WorkOrderItem) => {
    const nextStatus = item.status === 'completed' ? 'in_progress' : 'completed';
    try {
      await api.request(`/work-orders/${workOrderId}/items/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      loadWorkOrder();
    } catch (err: any) {
      alert(err.message || 'Ошибка изменения статуса позиции');
    }
  };

  const handleGenerateDoc = async (type: string) => {
    if (!workOrder) return;
    try {
      await api.generateDocument({
        type,
        work_order_id: workOrder.id,
        vehicle_id: workOrder.vehicle_id,
        customer_id: workOrder.customer_id,
        location_id: workOrder.location_id,
      });
      alert('Документ успешно сформирован и сохранен!');
      router.push('/documents');
    } catch (err: any) {
      alert(err.message || 'Ошибка генерации документа');
    }
  };

  if (isLoading) {
    return <div className="text-center py-16 text-slate-500 text-sm">Загрузка заказ-наряда...</div>;
  }

  if (!workOrder) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800">Заказ-наряд не найден</h2>
      </div>
    );
  }

  const isMechanic = user?.role?.name === 'MECHANIC' || (user?.role as any) === 'MECHANIC';

  return (
    <div className="space-y-6">
      {/* Top Bar with Status Transitions (Section 68) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Заказ-наряд #{workOrder.number}
              </h1>
              <Badge variant={workOrder.status === 'closed' ? 'emerald' : workOrder.status === 'completed' ? 'emerald' : workOrder.status === 'in_progress' ? 'sky' : 'amber'} size="md">
                {workOrder.status}
              </Badge>
              {workOrder.master && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  Механик: {workOrder.master.first_name} {workOrder.master.last_name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Открыт: {new Date(workOrder.opened_at).toLocaleDateString('ru-RU')} • Мастер-приемщик: {workOrder.advisor?.first_name} {workOrder.advisor?.last_name}
            </p>
          </div>
        </div>

        {/* Workflow Lifecycle Action Buttons (Section 68) */}
        <div className="flex flex-wrap items-center gap-2">
          {workOrder.status === 'waiting_approval' && (
            <Button variant="primary" size="md" onClick={() => handleStatusChange('approve')} className="font-bold">
              <Check className="w-4 h-4 mr-1" />
              <span>Согласовать заказ</span>
            </Button>
          )}

          {workOrder.status === 'approved' && (
            <Button variant="primary" size="md" onClick={() => handleStatusChange('start')} className="font-bold bg-sky-600 hover:bg-sky-700">
              <Play className="w-4 h-4 mr-1" />
              <span>В работу (Передать в цех)</span>
            </Button>
          )}

          {workOrder.status === 'in_progress' && (
            <Button variant="success" size="md" onClick={() => handleStatusChange('complete')} className="font-bold">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              <span>Завершить работы</span>
            </Button>
          )}

          {workOrder.status === 'completed' && (
            <Button variant="secondary" size="md" onClick={() => handleStatusChange('close')} className="font-bold">
              <Sparkles className="w-4 h-4 mr-1 text-emerald-400" />
              <span>Закрыть заказ и выдать авто</span>
            </Button>
          )}

          {/* Print Action */}
          <Button variant="outline" size="md" onClick={() => handleGenerateDoc('work_order')} className="font-semibold">
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Печать заказ-наряда</span>
          </Button>
        </div>
      </div>

      {/* Customer & Vehicle Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle summary */}
        <Card className="p-4 bg-slate-900 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Car className="w-8 h-8 text-sky-400 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-white">
                  {workOrder.vehicle?.make} {workOrder.vehicle?.model}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Госномер: <strong className="text-white">{workOrder.vehicle?.license_plate}</strong> • VIN: {workOrder.vehicle?.vin}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Пробег при приеме: <strong className="text-sky-400">{workOrder.mileage_in.toLocaleString('ru-RU')} км</strong>
                </p>
              </div>
            </div>
            <Link href={`/vehicles/${workOrder.vehicle_id}`}>
              <Button size="sm" variant="ghost" className="text-sky-400 hover:bg-slate-800 text-xs">
                История авто →
              </Button>
            </Link>
          </div>
        </Card>

        {/* Customer summary */}
        <Card className="p-4 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {workOrder.customer?.first_name} {workOrder.customer?.last_name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{workOrder.customer?.phone}</p>
                <p className="text-xs text-slate-400 mt-0.5">{workOrder.customer?.email || 'Email не указан'}</p>
              </div>
            </div>
            <Link href={`/customers/${workOrder.customer_id}`}>
              <Button size="sm" variant="ghost" className="text-indigo-600 hover:bg-indigo-50 text-xs">
                Карточка клиента →
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Complaints and Diagnostics */}
      <Card title="Жалобы заказчика и результаты диагностики">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Жалоба клиента:</span>
            <p className="text-slate-800 text-sm mt-1 font-medium">{workOrder.customer_complaint || 'Плановое техническое обслуживание'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Диагноз мастера:</span>
            <p className="text-slate-800 text-sm mt-1 font-medium">{workOrder.diagnosis || 'Требуется замена масла ДВС и фильтров по регламенту'}</p>
          </div>
        </div>
      </Card>

      {/* Section 68: Work Order Items Table (Работы & Запчасти) */}
      <Card
        title="Работы и запасные части"
        action={
          <Button variant="primary" size="sm" onClick={() => setIsAddItemModalOpen(true)}>
            <Plus className="w-4 h-4" />
            <span>Добавить работу / деталь</span>
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase bg-slate-50">
                <th className="p-3 w-12 text-center">№</th>
                <th className="p-3">Наименование</th>
                <th className="p-3 w-28 text-center">Тип</th>
                <th className="p-3 w-24 text-center">Кол-во</th>
                <th className="p-3 w-32 text-right">Цена</th>
                <th className="p-3 w-36 text-right">Сумма</th>
                <th className="p-3 w-32 text-center">Статус</th>
                <th className="p-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workOrder.items && workOrder.items.length > 0 ? (
                workOrder.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center text-xs text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{item.description}</p>
                      {item.assignee && (
                        <p className="text-xs text-slate-400">
                          Мастер: {item.assignee.first_name} {item.assignee.last_name}
                        </p>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase bg-slate-100 text-slate-700">
                        {item.type === 'labor' ? 'Работа' : item.type === 'part' ? 'Деталь' : 'Прочее'}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono">{item.quantity}</td>
                    <td className="p-3 text-right font-mono text-slate-700">{item.unit_price.toLocaleString('ru-RU')} ₽</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{item.total_price.toLocaleString('ru-RU')} ₽</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleItemStatus(item)}
                        className="cursor-pointer transition-transform hover:scale-105"
                        title="Нажмите для изменения статуса выполнения"
                      >
                        <Badge variant={item.status === 'completed' ? 'emerald' : 'amber'} size="sm">
                          {item.status === 'completed' ? '✓ Выполнено' : 'В работе'}
                        </Badge>
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-xs text-slate-400">
                    В заказе еще нет позиций. Нажмите &quot;Добавить работу / деталь&quot;
                  </td>
                </tr>
              )}
            </tbody>
            {/* Financial Summary */}
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 text-sm font-semibold">
                <td colSpan={5} className="p-3 text-right text-slate-600">Подытог:</td>
                <td className="p-3 text-right font-mono">{workOrder.subtotal.toLocaleString('ru-RU')} ₽</td>
                <td colSpan={2}></td>
              </tr>
              {workOrder.discount > 0 && (
                <tr className="bg-emerald-50/50 text-emerald-800 text-sm font-semibold">
                  <td colSpan={5} className="p-3 text-right">Скидка:</td>
                  <td className="p-3 text-right font-mono">-{workOrder.discount.toLocaleString('ru-RU')} ₽</td>
                  <td colSpan={2}></td>
                </tr>
              )}
              <tr className="bg-slate-900 text-white font-bold text-base">
                <td colSpan={5} className="p-4 text-right uppercase tracking-wider text-xs">Итого к оплате (Section 68):</td>
                <td className="p-4 text-right font-mono text-xl text-sky-400">{workOrder.total.toLocaleString('ru-RU')} ₽</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Quick Acts & Document Generation */}
      <Card title="Официальные документы по данному заказу">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Button variant="outline" size="sm" onClick={() => handleGenerateDoc('work_order')}>
            <FileText className="w-4 h-4 text-indigo-600 mr-1" />
            Заказ-наряд (Акт)
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleGenerateDoc('acceptance_act')}>
            <FileText className="w-4 h-4 text-sky-600 mr-1" />
            Акт приема-передачи ТС
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleGenerateDoc('completion_act')}>
            <FileText className="w-4 h-4 text-emerald-600 mr-1" />
            Акт выполненных работ
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleGenerateDoc('invoice')}>
            <FileText className="w-4 h-4 text-amber-600 mr-1" />
            Счет на оплату
          </Button>
        </div>
      </Card>

      {/* Assign Mechanic & Start Modal (BUG-04 fix) */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Передача заказ-наряда в цех и назначение механика"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Выберите ответственного автомеханика для выполнения сервисных работ по заказ-наряду #{workOrder.number}:
          </p>

          <Select
            label="Ответственный механик цеха"
            value={selectedMechanicId}
            onChange={(e) => setSelectedMechanicId(e.target.value)}
            options={mechanics.map((m) => ({
              value: m.id,
              label: `${m.first_name} ${m.last_name} (${m.email})`,
            }))}
          />

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-800">
            При передаче заказ перейдет в статус <strong>«В работе»</strong>, а механику будет направлено оповещение.
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsAssignModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" onClick={handleConfirmTransferToWorkshop} className="bg-sky-600 hover:bg-sky-700 font-bold">
              <Play className="w-4 h-4 mr-1" />
              Подтвердить передачу в цех
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Добавление работы или запчасти в заказ"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <Select
            label="Тип позиции"
            value={newItem.type}
            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            options={[
              { value: 'labor', label: 'Сервисная работа / услуга' },
              { value: 'part', label: 'Запасная часть / материал' },
              { value: 'other', label: 'Прочие услуги (диагностика, мойка)' },
            ]}
          />

          <Input
            label="Наименование работы или запчасти"
            placeholder="например: Замена тормозных колодок"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Количество"
              type="number"
              step="any"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
              required
            />
            <Input
              label="Цена за единицу (₽)"
              type="number"
              value={newItem.unit_price}
              onChange={(e) => setNewItem({ ...newItem, unit_price: Number(e.target.value) })}
              required
            />
          </div>

          <Select
            label="Назначенный механик"
            value={newItem.assigned_to}
            onChange={(e) => setNewItem({ ...newItem, assigned_to: e.target.value })}
            options={[
              { value: '', label: 'Не назначен' },
              ...mechanics.map((m) => ({
                value: m.id,
                label: `${m.first_name} ${m.last_name}`,
              })),
            ]}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsAddItemModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Добавить в заказ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
