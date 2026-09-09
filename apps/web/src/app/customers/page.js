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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CustomersPage;
const react_1 = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
const auth_store_1 = require("../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../components/ui/Card");
const Button_1 = require("../../components/ui/Button");
const Modal_1 = require("../../components/ui/Modal");
const Input_1 = require("../../components/ui/Input");
function CustomersPage() {
    const { api } = (0, auth_store_1.useAuthStore)();
    const [customers, setCustomers] = (0, react_1.useState)([]);
    const [search, setSearch] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = (0, react_1.useState)(false);
    const [newCust, setNewCust] = (0, react_1.useState)({
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
        }
        catch (err) {
            console.error('Error fetching customers:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(loadCustomers, 200);
        return () => clearTimeout(timer);
    }, [search]);
    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        try {
            await api.createCustomer(newCust);
            setIsCreateModalOpen(false);
            setNewCust({ first_name: '', last_name: '', phone: '+7 ', email: '', address: '', notes: '' });
            loadCustomers();
        }
        catch (err) {
            alert(err.message || 'Ошибка создания клиента');
        }
    };
    return (<div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <lucide_react_1.Users className="w-7 h-7 text-indigo-600"/> Клиентская база СТО
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Учет автовладельцев, контактных данных и привязанных транспортных средств
          </p>
        </div>
        <Button_1.Button variant="primary" size="md" className="font-bold shadow-md shadow-indigo-600/20" onClick={() => setIsCreateModalOpen(true)}>
          <lucide_react_1.Plus className="w-4 h-4"/>
          <span>Добавить клиента</span>
        </Button_1.Button>
      </div>

      <Card_1.Card className="p-3">
        <div className="relative">
          <lucide_react_1.Search className="w-4 h-4 text-slate-400 absolute left-3 top-3"/>
          <input type="text" placeholder="Поиск клиента по имени, фамилии, телефону или email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        </div>
      </Card_1.Card>

      {isLoading ? (<div className="text-center py-12 text-slate-500 text-sm">Загрузка клиентов...</div>) : customers.length === 0 ? (<Card_1.Card className="text-center py-16">
          <lucide_react_1.Users className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
          <h3 className="text-base font-bold text-slate-800">Клиенты не найдены</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            Добавьте первого клиента в систему для оформления приемок
          </p>
          <Button_1.Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <lucide_react_1.Plus className="w-4 h-4"/> Создать клиента
          </Button_1.Button>
        </Card_1.Card>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (<link_1.default key={c.id} href={`/customers/${c.id}`} className="block bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group">
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
                      <lucide_react_1.Phone className="w-3 h-3 text-slate-400"/> {c.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Автомобилей:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <lucide_react_1.Car className="w-3.5 h-3.5 text-indigo-600"/> {c.vehicles?.length || 0} авто
                  </span>
                </div>
                {c.email && (<div className="flex items-center justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-700 truncate max-w-[170px]">{c.email}</span>
                  </div>)}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Профиль клиента</span>
                <lucide_react_1.ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
              </div>
            </link_1.default>))}
        </div>)}

      {/* Create Customer Modal */}
      <Modal_1.Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Добавление нового клиента">
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input_1.Input label="Имя" placeholder="Иван" value={newCust.first_name} onChange={(e) => setNewCust({ ...newCust, first_name: e.target.value })} required/>
            <Input_1.Input label="Фамилия" placeholder="Петров" value={newCust.last_name} onChange={(e) => setNewCust({ ...newCust, last_name: e.target.value })} required/>
          </div>

          <Input_1.Input label="Номер телефона" placeholder="+7 (999) 000-00-00" value={newCust.phone} onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })} required/>

          <Input_1.Input label="Email" type="email" placeholder="client@example.com" value={newCust.email} onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}/>

          <Input_1.Input label="Адрес проживания" placeholder="г. Москва, ул. Ленина, д. 1" value={newCust.address} onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}/>

          <Input_1.Input label="Заметки" placeholder="Особые пожелания клиента..." value={newCust.notes} onChange={(e) => setNewCust({ ...newCust, notes: e.target.value })}/>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button_1.Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Отмена
            </Button_1.Button>
            <Button_1.Button variant="primary" type="submit">
              Сохранить клиента
            </Button_1.Button>
          </div>
        </form>
      </Modal_1.Modal>
    </div>);
}
//# sourceMappingURL=page.js.map