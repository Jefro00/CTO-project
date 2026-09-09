"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomePage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const auth_store_1 = require("../stores/auth.store");
function HomePage() {
    const router = (0, navigation_1.useRouter)();
    const { isAuthenticated, isLoading } = (0, auth_store_1.useAuthStore)();
    (0, react_1.useEffect)(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.push('/dashboard');
            }
            else {
                router.push('/login');
            }
        }
    }, [isAuthenticated, isLoading, router]);
    return (<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"/>
    </div>);
}
//# sourceMappingURL=page.js.map