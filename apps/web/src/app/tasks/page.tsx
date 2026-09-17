'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  Car,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Task, TaskPriority, TaskStatus, User as UserType } from '@automotive-os/types';

export default function TasksPage() {
  const { api, user, currentLocation } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: TaskPriority.NORMAL,
    assigned_to: '',
    due_at: '',
  });

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const tRes = await api.getTasks();
      setTasks(tRes.data || []);

      try {
        const uRes = await api.getUsers();
        setUsers(uRes.data || []);
        if (uRes.data && uRes.data.length > 0 && !newTask.assigned_to) {
          setNewTask((prev) => ({ ...prev, assigned_to: uRes.data[0].id }));
        }
      } catch {
        // Fallback for roles without users.read
        if (user) {
          setUsers([user]);
          setNewTask((prev) => ({ ...prev, assigned_to: user.id }));
        }
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTask({
        ...newTask,
        location_id: currentLocation?.id,
      });
      setIsCreateModalOpen(false);
      setNewTask({ title: '', description: '', priority: TaskPriority.NORMAL, assigned_to: users[0]?.id || '', due_at: '' });
      loadTasks();
    } catch (err: any) {
      alert(err.message || 'Ошибка создания задачи');
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await api.completeTask(taskId);
      loadTasks();
    } catch (err: any) {
      alert(err.message || 'Ошибка обновления задачи');
    }
  };

  const priorityColors = {
    critical: 'bg-rose-500 text-white',
    high: 'bg-amber-500 text-white',
    normal: 'bg-indigo-50 text-indigo-700',
    low: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-indigo-600" /> Задачи и поручения цеха
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Контроль сервисных работ, звонков клиентам и поручений мастерам (Section 47 & 23)
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="font-bold shadow-md shadow-indigo-600/20"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Создать задачу</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Загрузка задач...</div>
      ) : tasks.length === 0 ? (
        <Card className="text-center py-16">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Все задачи выполнены</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Создайте новую задачу для сотрудников цеха или мастеров
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4" /> Добавить задачу
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={`hover:shadow-md transition-all flex flex-col justify-between ${
                task.status === 'completed' ? 'opacity-60 bg-slate-50/60' : 'bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${priorityColors[task.priority] || priorityColors.normal}`}>
                    {task.priority}
                  </span>
                  <Badge variant={task.status === 'completed' ? 'emerald' : 'gray'} size="sm">
                    {task.status}
                  </Badge>
                </div>

                <h3 className={`text-sm font-bold text-slate-900 ${task.status === 'completed' ? 'line-through' : ''}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                )}

                {task.vehicle && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2 text-xs">
                    <Car className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-700">{task.vehicle.make} {task.vehicle.model}</span>
                    <span className="font-mono text-[10px] text-slate-400">({task.vehicle.license_plate})</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {task.assignee ? `${task.assignee.first_name} ${task.assignee.last_name}` : 'Все'}
                </span>
                {task.status !== 'completed' && (
                  <Button variant="outline" size="sm" onClick={() => handleComplete(task.id)}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                    Завершить
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Новая сервисная задача"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Название задачи"
            placeholder="например: Проверить остаток масла в бочке"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />

          <Input
            label="Подробное описание"
            placeholder="Что именно необходимо выполнить..."
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Приоритет"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              options={[
                { value: 'low', label: 'Низкий' },
                { value: 'normal', label: 'Обычный' },
                { value: 'high', label: 'Высокий' },
                { value: 'critical', label: 'Критический ⚡' },
              ]}
            />

            <Select
              label="Исполнитель"
              value={newTask.assigned_to}
              onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
              options={users.map((u) => ({
                value: u.id,
                label: `${u.first_name} ${u.last_name}`,
              }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" type="submit">
              Создать задачу
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
