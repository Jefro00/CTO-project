"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
const api_client_1 = require("@automotive-os/api-client");
const permissions_1 = require("@automotive-os/permissions");
const api = new api_client_1.AutomotiveApiClient(typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:4000/api/v1`
    : 'http://localhost:4000/api/v1');
exports.useAuthStore = (0, zustand_1.create)((set, get) => ({
    token: null,
    user: null,
    organization: null,
    currentLocation: null,
    locations: [],
    isAuthenticated: false,
    isLoading: true,
    api,
    setAuth: (token, user, organization) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('aos_token', token);
            localStorage.setItem('aos_user', JSON.stringify(user));
        }
        api.setToken(token);
        set({
            token,
            user,
            organization: organization || user.organization || null,
            currentLocation: user.location || null,
            isAuthenticated: true,
            isLoading: false,
        });
    },
    setCurrentLocation: (loc) => {
        set({ currentLocation: loc });
    },
    setLocations: (locations) => {
        set({ locations });
    },
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('aos_token');
            localStorage.removeItem('aos_user');
        }
        api.setToken(null);
        set({
            token: null,
            user: null,
            organization: null,
            currentLocation: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },
    can: (permission) => {
        const { user } = get();
        if (!user || !user.permissions)
            return false;
        return (0, permissions_1.hasPermission)(user.permissions, permission);
    },
    initialize: async () => {
        if (typeof window === 'undefined') {
            set({ isLoading: false });
            return;
        }
        const savedToken = localStorage.getItem('aos_token');
        if (!savedToken) {
            set({ isLoading: false });
            return;
        }
        try {
            api.setToken(savedToken);
            const res = await api.getMe();
            if (res.data) {
                const orgRes = await api.getOrganization().catch(() => ({ data: null }));
                const locRes = await api.getLocations().catch(() => ({ data: [] }));
                set({
                    token: savedToken,
                    user: res.data,
                    organization: orgRes.data || res.data.organization || null,
                    currentLocation: res.data.location || (locRes.data && locRes.data[0]) || null,
                    locations: locRes.data || [],
                    isAuthenticated: true,
                    isLoading: false,
                });
                return;
            }
        }
        catch (e) {
            console.warn('Session expired or API unreachable:', e);
            localStorage.removeItem('aos_token');
            localStorage.removeItem('aos_user');
            api.setToken(null);
        }
        set({ isLoading: false });
    },
}));
//# sourceMappingURL=auth.store.js.map