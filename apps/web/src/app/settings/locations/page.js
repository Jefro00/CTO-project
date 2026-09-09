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
exports.default = LocationsAndBackupsSettingsPage;
const react_1 = __importStar(require("react"));
const auth_store_1 = require("../../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../../components/ui/Card");
const Button_1 = require("../../../components/ui/Button");
const Badge_1 = require("../../../components/ui/Badge");
const Modal_1 = require("../../../components/ui/Modal");
const Input_1 = require("../../../components/ui/Input");
function LocationsAndBackupsSettingsPage() {
    const { api, organization } = (0, auth_store_1.useAuthStore)();
    const [locations, setLocations] = (0, react_1.useState)([]);
    const [backups, setBackups] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    // New location modal
    const [isLocModalOpen, setIsLocModalOpen] = (0, react_1.useState)(false);
    const [newLoc, setNewLoc] = (0, react_1.useState)({
        name: '',
        city: 'Москва',
        address: '',
        phone: '',
        email: '',
    });
    // Restore confirmation modal
    const [isRestoreModalOpen, setIsRestoreModalOpen] = (0, react_1.useState)(false);
    const [selectedBackupId, setSelectedBackupId] = (0, react_1.useState)('');
    const [restoreToken, setRestoreToken] = (0, react_1.useState)('');
    const [isBackingUp, setIsBackingUp] = (0, react_1.useState)(false);
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [lRes, bRes] = await Promise.all([
                api.getLocations(),
                api.getBackups().catch(() => ({ data: [] })),
            ]);
            setLocations(lRes.data || []);
            setBackups(bRes.data || []);
        }
        catch (err) {
            console.error('Error fetching locations:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    const handleCreateLocation = async (e) => {
        e.preventDefault();
        try {
            await api.createLocation(newLoc);
            setIsLocModalOpen(false);
            setNewLoc({ name: '', city: 'Москва', address: '', phone: '', email: '' });
            loadData();
        }
        catch (err) {
            alert(err.message || 'Ошибка создания филиала');
        }
    };
    const handleCreateBackup = async () => {
        setIsBackingUp(true);
        try {
            await api.createBackup('manual');
            alert('Резервная копия организации (.aosbackup) успешно создана!');
            loadData();
        }
        catch (err) {
            alert(err.message || 'Ошибка создания резервной копии');
        }
        finally {
            setIsBackingUp(false);
        }
    };
    const handleRestore = async (e) => {
        e.preventDefault();
        try {
            const res = await api.restoreBackup(selectedBackupId, restoreToken);
            alert(res.message || 'Организация успешно восстановлена из бэкапа!');
            setIsRestoreModalOpen(false);
            setRestoreToken('');
            loadData();
        }
        catch (err) {
            alert(err.message || 'Ошибка восстановления бэкапа');
        }
    };
    return (<div className="space-y-8">
      {/* Locations Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <lucide_react_1.MapPin className="w-7 h-7 text-indigo-600"/> Филиалы и посты СТО
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Управление сетью автосервисов и филиальной изоляцией (Section 34 & 9)
            </p>
          </div>
          <Button_1.Button variant="primary" size="md" onClick={() => setIsLocModalOpen(true)}>
            <lucide_react_1.Plus className="w-4 h-4"/>
            <span>Добавить филиал</span>
          </Button_1.Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => (<Card_1.Card key={loc.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    <lucide_react_1.Building2 className="w-5 h-5"/>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{loc.name}</h3>
                    <p className="text-xs text-slate-500">{loc.city || 'Москва'}</p>
                  </div>
                </div>
                <Badge_1.Badge variant={loc.status === 'active' ? 'emerald' : 'gray'} size="sm">
                  {loc.status}
                </Badge_1.Badge>
              </div>
              <div className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 space-y-1">
                <p><strong>Адрес:</strong> {loc.address || 'ул. Автозаводская, д. 23'}</p>
                <p><strong>Телефон:</strong> {loc.phone || '+7 (495) 777-00-11'}</p>
              </div>
            </Card_1.Card>))}
        </div>
      </div>

      {/* Backups & Restore Section (Section 52 & 77-79) */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <lucide_react_1.HardDriveDownload className="w-6 h-6 text-indigo-600"/> Резервные копии и архивация (.aosbackup)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Полный снимок базы данных, настроек и манифеста организации (Section 77-79)
            </p>
          </div>
          <Button_1.Button variant="secondary" size="md" isLoading={isBackingUp} onClick={handleCreateBackup} className="font-bold">
            <lucide_react_1.FileArchive className="w-4 h-4 mr-1"/>
            <span>Создать бэкап организации</span>
          </Button_1.Button>
        </div>

        {backups.length === 0 ? (<Card_1.Card className="text-center py-8 text-xs text-slate-400">
            Резервные копии еще не создавались
          </Card_1.Card>) : (<div className="space-y-2">
            {backups.map((b) => (<Card_1.Card key={b.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <lucide_react_1.FileArchive className="w-6 h-6 text-indigo-600 shrink-0"/>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Резервный пакет: {b.storage_key ? b.storage_key.split('/').pop() : 'automotive-backup.aosbackup'}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Размер: {(b.size / 1024).toFixed(1)} KB • Контрольная сумма SHA-256: {b.checksum?.slice(0, 16)}...
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Создано: {new Date(b.created_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge_1.Badge variant="emerald" size="sm">
                    {b.status}
                  </Badge_1.Badge>
                  <Button_1.Button variant="outline" size="sm" onClick={() => {
                    setSelectedBackupId(b.id);
                    setIsRestoreModalOpen(true);
                }}>
                    <lucide_react_1.RotateCcw className="w-3.5 h-3.5 mr-1"/>
                    Восстановить
                  </Button_1.Button>
                </div>
              </Card_1.Card>))}
          </div>)}
      </div>

      {/* Location Modal */}
      <Modal_1.Modal isOpen={isLocModalOpen} onClose={() => setIsLocModalOpen(false)} title="Добавление нового филиала СТО">
        <form onSubmit={handleCreateLocation} className="space-y-4">
          <Input_1.Input label="Название филиала" placeholder="например: СТО №3 (Восток)" value={newLoc.name} onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })} required/>
          <div className="grid grid-cols-2 gap-3">
            <Input_1.Input label="Город" value={newLoc.city} onChange={(e) => setNewLoc({ ...newLoc, city: e.target.value })}/>
            <Input_1.Input label="Телефон филиала" value={newLoc.phone} onChange={(e) => setNewLoc({ ...newLoc, phone: e.target.value })}/>
          </div>
          <Input_1.Input label="Фактический адрес" placeholder="Шоссе Энтузиастов, д. 40" value={newLoc.address} onChange={(e) => setNewLoc({ ...newLoc, address: e.target.value })}/>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button_1.Button variant="ghost" type="button" onClick={() => setIsLocModalOpen(false)}>
              Отмена
            </Button_1.Button>
            <Button_1.Button variant="primary" type="submit">
              Сохранить филиал
            </Button_1.Button>
          </div>
        </form>
      </Modal_1.Modal>

      {/* Restore Confirmation Modal (Section 52) */}
      <Modal_1.Modal isOpen={isRestoreModalOpen} onClose={() => setIsRestoreModalOpen(false)} title="Подтверждение восстановления из резервной копии">
        <form onSubmit={handleRestore} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-start gap-2">
            <lucide_react_1.AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"/>
            <div>
              <p className="font-bold">Внимание!</p>
              <p>Восстановление заменит текущие данные организации на состояние из выбранного архивного пакета.</p>
            </div>
          </div>

          <Input_1.Input label='Введите токен подтверждения "RESTORE_CONFIRM"' placeholder="RESTORE_CONFIRM" value={restoreToken} onChange={(e) => setRestoreToken(e.target.value)} required/>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button_1.Button variant="ghost" type="button" onClick={() => setIsRestoreModalOpen(false)}>
              Отмена
            </Button_1.Button>
            <Button_1.Button variant="danger" type="submit">
              Подтвердить восстановление
            </Button_1.Button>
          </div>
        </form>
      </Modal_1.Modal>
    </div>);
}
//# sourceMappingURL=page.js.map