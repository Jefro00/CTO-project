"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUIStore = void 0;
const zustand_1 = require("zustand");
exports.useUIStore = (0, zustand_1.create)((set) => ({
    isSearchOpen: false,
    openSearch: () => set({ isSearchOpen: true }),
    closeSearch: () => set({ isSearchOpen: false }),
    toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
    isMobileSimulator: false,
    setMobileSimulator: (val) => set({ isMobileSimulator: val }),
    toggleMobileSimulator: () => set((state) => ({ isMobileSimulator: !state.isMobileSimulator })),
    isNotificationsOpen: false,
    setNotificationsOpen: (val) => set({ isNotificationsOpen: val }),
    activeTab: 'overview',
    setActiveTab: (activeTab) => set({ activeTab }),
}));
//# sourceMappingURL=ui.store.js.map