"use strict";
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
exports.TopNav = void 0;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const auth_store_1 = require("../../stores/auth.store");
const ui_store_1 = require("../../stores/ui.store");
const TopNav = () => {
    const { user, locations, currentLocation, setCurrentLocation, logout, api } = (0, auth_store_1.useAuthStore)();
    const { openSearch, isMobileSimulator, toggleMobileSimulator } = (0, ui_store_1.useUIStore)();
    const [notifications, setNotifications] = (0, react_1.useState)([]);
    const [showNotifs, setShowNotifs] = (0, react_1.useState)(false);
    const [isSyncing, setIsSyncing] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (!user)
            return;
        const fetchNotifs = async () => {
            try {
                const res = await api.getNotifications();
                setNotifications(res.data || []);
            }
            catch (err) {
                // ignore
            }
        };
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 10000);
        return () => clearInterval(interval);
    }, [user, api]);
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    const handleMarkAllRead = async () => {
        await api.markAllNotificationsRead();
        setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    };
    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 800);
    };
    return (<header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Search Bar Input / Trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button onClick={openSearch} className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100/80 hover:bg-slate-100 text-slate-500 rounded-xl text-sm transition-all border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <div className="flex items-center gap-2">
            <lucide_react_1.Search className="w-4 h-4 text-slate-400"/>
            <span className="text-slate-400">Быстрый поиск (VIN, госномер, клиент, заказ)...</span>
          </div>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md shadow-xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Branch / Location Switcher */}
        {locations.length > 1 && (<div className="relative">
            <select value={currentLocation?.id || ''} onChange={(e) => {
                const found = locations.find((l) => l.id === e.target.value);
                if (found)
                    setCurrentLocation(found);
            }} className="text-xs font-semibold py-1.5 pl-7 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer">
              {locations.map((loc) => (<option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>))}
            </select>
            <lucide_react_1.MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none"/>
            <lucide_react_1.ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none"/>
          </div>)}

        {/* Offline / Sync Status (Section 70-73) */}
        <button onClick={handleSync} title="Синхронизация данных" className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors">
          <lucide_react_1.RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}/>
          <span>Online / Synced</span>
        </button>

        {/* Device Switcher (Desktop Web vs Mobile Smartphone Simulator) */}
        <button onClick={toggleMobileSimulator} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isMobileSimulator
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}`} title="Переключить режим отображения (Десктоп / Мобильный смартфон приемщика)">
          {isMobileSimulator ? (<>
              <lucide_react_1.Smartphone className="w-3.5 h-3.5"/>
              <span>Режим: Mobile App</span>
            </>) : (<>
              <lucide_react_1.Monitor className="w-3.5 h-3.5"/>
              <span>Режим: Desktop Web</span>
            </>)}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors">
            <lucide_react_1.Bell className="w-5 h-5"/>
            {unreadCount > 0 && (<span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>)}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (<div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase">Уведомления</span>
                {unreadCount > 0 && (<button onClick={handleMarkAllRead} className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium">
                    Прочитать все
                  </button>)}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (<div className="py-6 text-center text-xs text-slate-400">Нет новых уведомлений</div>) : (notifications.map((n) => (<div key={n.id} className={`p-3 text-xs transition-colors ${n.is_read ? 'bg-white text-slate-600' : 'bg-indigo-50/40 text-slate-900 font-medium'}`}>
                      <p className="font-bold text-slate-900">{n.title}</p>
                      <p className="text-slate-600 mt-0.5">{n.body}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>)))}
              </div>
            </div>)}
        </div>

        {/* Logout */}
        <button onClick={logout} title="Выйти из системы" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
          <lucide_react_1.LogOut className="w-5 h-5"/>
        </button>
      </div>
    </header>);
};
exports.TopNav = TopNav;
//# sourceMappingURL=TopNav.js.map