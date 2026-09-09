"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TasksPage;
const react_1 = __importStar(require("react"));
const auth_store_1 = require("../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../components/ui/Card");
const Button_1 = require("../../components/ui/Button");
const Badge_1 = require("../../components/ui/Badge");
const Modal_1 = require("../../components/ui/Modal");
const Input_1 = require("../../components/ui/Input");
const Select_1 = require("../../components/ui/Select");
const types_1 = require("@automotive-os/types");
function TasksPage() {
    const { api, user, currentLocation } = (0, auth_store_1.useAuthStore)();
    const [tasks, setTasks] = (0, react_1.useState)([]);
    const [users, setUsers] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = (0, react_1.useState)(false);
    const [newTask, setNewTask] = (0, react_1.useState)({
        title: '',
        description: '',
        priority: types_1.TaskPriority.NORMAL,
        assigned_to: '',
        due_at: '',
    });
    const loadTasks = async () => {
        setIsLoading(true);
        try {
            const [tRes, uRes] = await Promise.all([
                api.getTasks(),
                api.request('/users'),
            ]);
            setTasks(tRes.data || []);
            setUsers(uRes.data || []);
            if (uRes.data && uRes.data.length > 0 && !newTask.assigned_to) {
                setNewTask((prev) => ({ ...prev, assigned_to: uRes.data[0].id }));
            }
        }
        catch (err) {
            console.error('Error fetching tasks:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadTasks();
    }, []);
    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.createTask({
                ...newTask,
                location_id: currentLocation?.id,
            });
            setIsCreateModalOpen(false);
            setNewTask({ title: '', description: '', priority: types_1.TaskPriority.NORMAL, assigned_to: users[0]?.id || '', due_at: '' });
            loadTasks();
        }
        catch (err) {
            alert(err.message || 'Ошибка создания задачи');
        }
    };
    const handleComplete = async (taskId) => {
        try {
            await api.completeTask(taskId);
            loadTasks();
        }
        catch (err) {
            alert(err.message || 'Ошибка обновления задачи');
        }
    };
    const priorityColors = {
        critical: 'bg-rose-500 text-white',
        high: 'bg-amber-500 text-white',
        normal: 'bg-indigo-50 text-indigo-700',
        low: 'bg-slate-100 text-slate-700',
    };
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <lucide_react_1.CheckSquare className="w-7 h-7 text-indigo-600"/> Задачи и поручения цеха
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Контроль сервисных работ, звонков клиентам и поручений мастерам (Section 47 & 23)
          </p>
        </div>
        <Button_1.Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20" onClick={() => setIsCreateModalOpen(true)}>
          <lucide_react_1.Plus className="w-4 h-4"/>
          <span>Создать задачу</span>
        </Button_1.Button>
      </div>

      {isLoading ? (<div className="text-center py-12 text-slate-500 text-sm">Загрузка задач...</div>) : tasks.length === 0 ? (<Card_1.Card className="text-center py-16">
          <lucide_react_1.CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
          <h3 className="text-base font-bold text-slate-800">Все задачи выполнены</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Создайте новую задачу для сотрудников цеха или мастеров
          </p>
          <Button_1.Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <lucide_react_1.Plus className="w-4 h-4"/> Добавить задачу
          </Button_1.Button>
        </Card_1.Card>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (<Card_1.Card key={task.id} className={`hover:shadow-md transition-all flex flex-col justify-between ${task.status === 'completed' ? 'opacity-60 bg-slate-50/60' : 'bg-white'}`}>
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${priorityColors[task.priority] || priorityColors.normal}`}>
                    {task.priority}
                  </span>
                  <Badge_1.Badge variant={task.status === 'completed' ? 'emerald' : 'gray'} size="sm">
                    {task.status}
                  </Badge_1.Badge>
                </div>

                <h3 className={`text-sm font-bold text-slate-900 ${task.status === 'completed' ? 'line-through' : ''}`}>
                  {task.title}
                </h3>
                {task.description && (<p className="text-xs text-slate-500 mt-1">{task.description}</p>)}

                {task.vehicle && (<div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2 text-xs">
                    <lucide_react_1.Car className="w-3.5 h-3.5 text-slate-500"/>
                    <span className="font-semibold text-slate-700">{task.vehicle.make} {task.vehicle.model}</span>
                    <span className="font-mono text-[10px] text-slate-400">({task.vehicle.license_plate})</span>
                  </div>)}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {task.assignee ? `${task.assignee.first_name} ${task.assignee.last_name}` : 'Все'}
                </span>
                {task.status !== 'completed' && (<Button_1.Button variant="outline" size="sm" onClick={() => handleComplete(task.id)}>
                    <lucide_react_1.CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1"/>
                    Завершить
                  </Button_1.Button>)}
              </div>
            </Card_1.Card>))}
        </div>)}

      {/* Create Task Modal */}
      <Modal_1.Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Новая сервисная задача">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input_1.Input label="Название задачи" placeholder="например: Проверить остаток масла в бочке" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required/>

          <Input_1.Input label="Подробное описание" placeholder="Что именно необходимо выполнить..." value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}/>

          <div className="grid grid-cols-2 gap-3">
            <Select_1.Select label="Приоритет" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} options={[
            { value: 'low', label: 'Низкий' },
            { value: 'normal', label: 'Обычный' },
            { value: 'high', label: 'Высокий' },
            { value: 'critical', label: 'Критический ⚡' },
        ]}/>

            <Select_1.Select label="Исполнитель" value={newTask.assigned_to} onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })} options={users.map((u) => ({
            value: u.id,
            label: `${u.first_name} ${u.last_name}`,
        }))}/>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button_1.Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Отмена
            </Button_1.Button>
            <Button_1.Button variant="primary" type="submit">
              Создать задачу
            </Button_1.Button>
          </div>
        </form>
      </Modal_1.Modal>
    </div>);
}
//# sourceMappingURL=page.js.map