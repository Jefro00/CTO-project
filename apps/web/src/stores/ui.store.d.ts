interface UIState {
    isSearchOpen: boolean;
    openSearch: () => void;
    closeSearch: () => void;
    toggleSearch: () => void;
    isMobileSimulator: boolean;
    setMobileSimulator: (val: boolean) => void;
    toggleMobileSimulator: () => void;
    isNotificationsOpen: boolean;
    setNotificationsOpen: (val: boolean) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}
export declare const useUIStore: import("zustand").UseBoundStore<import("zustand").StoreApi<UIState>>;
export {};
