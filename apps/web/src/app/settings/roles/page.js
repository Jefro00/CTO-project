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
exports.default = RolesSettingsPage;
const react_1 = __importStar(require("react"));
const auth_store_1 = require("../../../stores/auth.store");
const lucide_react_1 = require("lucide-react");
const Card_1 = require("../../../components/ui/Card");
function RolesSettingsPage() {
    const { api } = (0, auth_store_1.useAuthStore)();
    const [roles, setRoles] = (0, react_1.useState)([]);
    const [permissions, setPermissions] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const loadRoles = async () => {
            try {
                const [rRes, pRes] = await Promise.all([
                    api.request('/roles'),
                    api.request('/permissions'),
                ]);
                setRoles(rRes.data || []);
                setPermissions(pRes.data || []);
            }
            catch (err) {
                console.error('Error fetching roles:', err);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadRoles();
    }, [api]);
    return (<div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <lucide_react_1.Settings className="w-7 h-7 text-indigo-600"/> Роли и матрица прав доступа
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Системные роли и гранулярные разрешения пользователей (Section 58 & 11-13)
        </p>
      </div>

      {isLoading ? (<div className="text-center py-12 text-slate-500 text-sm">Загрузка матрицы прав...</div>) : (<Card_1.Card title="Матрица прав доступа по ролям (Section 58)">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase">
                  <th className="p-3">Код разрешения</th>
                  {roles.map((r) => (<th key={r.id} className="p-3 text-center whitespace-nowrap">
                      {r.name}
                    </th>))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissions.map((p) => (<tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-mono font-semibold text-slate-800">
                      {p.code}
                      {p.description && (<span className="block text-[10px] text-slate-400 font-sans font-normal">
                          {p.description}
                        </span>)}
                    </td>
                    {roles.map((r) => {
                    const hasPerm = r.name === 'OWNER' ||
                        r.permissions?.some((rp) => rp.code === p.code || rp.code === '*');
                    return (<td key={r.id} className="p-3 text-center">
                          {hasPerm ? (<span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                              <lucide_react_1.Check className="w-3.5 h-3.5"/>
                            </span>) : (<span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-300">
                              <lucide_react_1.X className="w-3.5 h-3.5"/>
                            </span>)}
                        </td>);
                })}
                  </tr>))}
              </tbody>
            </table>
          </div>
        </Card_1.Card>)}
    </div>);
}
//# sourceMappingURL=page.js.map