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
exports.default = UsersSettingsPage;
const react_1 = __importStar(require("react"));
const auth_store_1 = require("../../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../../components/ui/Card");
const Button_1 = require("../../../components/ui/Button");
const Badge_1 = require("../../../components/ui/Badge");
const Modal_1 = require("../../../components/ui/Modal");
const Input_1 = require("../../../components/ui/Input");
const Select_1 = require("../../../components/ui/Select");
function UsersSettingsPage() {
    const { api, user } = (0, auth_store_1.useAuthStore)();
    const [users, setUsers] = (0, react_1.useState)([]);
    const [roles, setRoles] = (0, react_1.useState)([]);
    const [locations, setLocations] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [newUser, setNewUser] = (0, react_1.useState)({
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
                api.request('/users'),
                api.request('/roles'),
                api.getLocations(),
            ]);
            setUsers(uRes.data || []);
            setRoles(rRes.data || []);
            setLocations(lRes.data || []);
            if (rRes.data && rRes.data.length > 0 && !newUser.role_id) {
                setNewUser((prev) => ({ ...prev, role_id: rRes.data[0].id }));
            }
        }
        catch (err) {
            console.error('Error fetching users:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    const handleCreateUser = async (e) => {
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
        }
        catch (err) {
            alert(err.message || 'Ошибка создания пользователя');
        }
    };
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <lucide_react_1.Shield className="w-7 h-7 text-indigo-600"/> Управление сотрудниками
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Список учетных записей, привязка к филиалам и назначение ролей (Section 35 & 10)
          </p>
        </div>
        <Button_1.Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20" onClick={() => setIsModalOpen(true)}>
          <lucide_react_1.Plus className="w-4 h-4"/>
          <span>Добавить сотрудника</span>
        </Button_1.Button>
      </div>

      {isLoading ? (<div className="text-center py-12 text-slate-500 text-sm">Загрузка пользователей...</div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (<Card_1.Card key={u.id} className="hover:border-indigo-300 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
                  {u.first_name?.[0]}{u.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {u.first_name} {u.last_name}
                    </h3>
                    <Badge_1.Badge variant={u.role_name === 'OWNER' ? 'purple' : 'indigo'} size="sm">
                      {u.role_name}
                    </Badge_1.Badge>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{u.email}</p>
                  <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                    <lucide_react_1.MapPin className="w-3 h-3 text-slate-400"/>
                    Филиал: {u.location_name || 'Все филиалы (Global Scope)'}
                  </p>
                </div>
              </div>
            </Card_1.Card>))}
        </div>)}

      {/* Modal */}
      <Modal_1.Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Создание новой учетной записи">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input_1.Input label="Имя" value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} required/>
            <Input_1.Input label="Фамилия" value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} required/>
          </div>

          <Input_1.Input label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required/>

          <Input_1.Input label="Пароль" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required/>

          <Select_1.Select label="Системная роль" value={newUser.role_id} onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })} options={roles.map((r) => ({
            value: r.id,
            label: `${r.name} (${r.description || ''})`,
        }))} required/>

          <Select_1.Select label="Филиал (Location Scope)" value={newUser.location_id} onChange={(e) => setNewUser({ ...newUser, location_id: e.target.value })} options={[
            { value: '', label: 'Все филиалы организации (Network Scope)' },
            ...locations.map((l) => ({ value: l.id, label: l.name })),
        ]}/>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button_1.Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button_1.Button>
            <Button_1.Button variant="primary" type="submit">
              Создать
            </Button_1.Button>
          </div>
        </form>
      </Modal_1.Modal>
    </div>);
}
//# sourceMappingURL=page.js.map