import { create } from 'zustand';

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

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  isMobileSimulator: false,
  setMobileSimulator: (val: boolean) => set({ isMobileSimulator: val }),
  toggleMobileSimulator: () => set((state) => ({ isMobileSimulator: !state.isMobileSimulator })),
  isNotificationsOpen: false,
  setNotificationsOpen: (val: boolean) => set({ isNotificationsOpen: val }),
  activeTab: 'overview',
  setActiveTab: (activeTab: string) => set({ activeTab }),
}));
