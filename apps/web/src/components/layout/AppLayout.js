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
exports.AppLayout = void 0;
const react_1 = __importStar(require("react"));
const auth_store_1 = require("../../stores/auth.store");
const ui_store_1 = require("../../stores/ui.store");
const Sidebar_1 = require("./Sidebar");
const TopNav_1 = require("./TopNav");
const GlobalSearchModal_1 = require("./GlobalSearchModal");
const MobileSimulatorWrapper_1 = require("./MobileSimulatorWrapper");
const navigation_1 = require("next/navigation");
const AppLayout = ({ children }) => {
    const { isAuthenticated, isLoading, initialize } = (0, auth_store_1.useAuthStore)();
    const { isMobileSimulator } = (0, ui_store_1.useUIStore)();
    const router = (0, navigation_1.useRouter)();
    const pathname = (0, navigation_1.usePathname)();
    (0, react_1.useEffect)(() => {
        initialize();
    }, [initialize]);
    (0, react_1.useEffect)(() => {
        if (!isLoading && !isAuthenticated && pathname !== '/login') {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, pathname, router]);
    if (isLoading) {
        return (<div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"/>
          <p className="text-sm font-semibold text-slate-300">Загрузка Automotive OS...</p>
        </div>
      </div>);
    }
    if (pathname === '/login') {
        return <>{children}</>;
    }
    if (isMobileSimulator) {
        return (<>
        <MobileSimulatorWrapper_1.MobileSimulatorWrapper>{children}</MobileSimulatorWrapper_1.MobileSimulatorWrapper>
        <GlobalSearchModal_1.GlobalSearchModal />
      </>);
    }
    return (<div className="min-h-screen bg-slate-50 flex">
      <Sidebar_1.Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav_1.TopNav />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
      <GlobalSearchModal_1.GlobalSearchModal />
    </div>);
};
exports.AppLayout = AppLayout;
//# sourceMappingURL=AppLayout.js.map