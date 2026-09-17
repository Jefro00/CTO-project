import { create } from 'zustand';
import { User, Organization, Location } from '@automotive-os/types';
import { AutomotiveApiClient } from '@automotive-os/api-client';
import { hasPermission } from '@automotive-os/permissions';

interface AuthState {
  token: string | null;
  user: User | null;
  organization: Organization | null;
  currentLocation: Location | null;
  locations: Location[];
  isAuthenticated: boolean;
  isLoading: boolean;
  api: AutomotiveApiClient;
  setAuth: (token: string, user: User, organization?: Organization) => void;
  setCurrentLocation: (loc: Location | null) => void;
  setLocations: (locs: Location[]) => void;
  logout: () => void;
  can: (permission: string) => boolean;
  initialize: () => Promise<void>;
}

const api = new AutomotiveApiClient(
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:4000/api/v1`
    : 'http://localhost:4000/api/v1',
);

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  organization: null,
  currentLocation: null,
  locations: [],
  isAuthenticated: false,
  isLoading: true,
  api,

  setAuth: (token: string, user: User, organization?: Organization) => {
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

  setCurrentLocation: (loc: Location | null) => {
    set({ currentLocation: loc });
  },

  setLocations: (locations: Location[]) => {
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
      locations: [],
      isAuthenticated: false,
      isLoading: false,
    });
  },

  can: (permission: string) => {
    const { user } = get();
    if (!user || !user.permissions) return false;
    return hasPermission(user.permissions, permission);
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
        const u = res.data;
        let userLocations: Location[] = u.location ? [u.location] : [];
        let orgData: Organization | null = u.organization || null;

        // Only fetch org and locations if permissions allow
        const userPerms = u.permissions || [];
        const canReadOrg = userPerms.includes('*') || userPerms.includes('organization.read');
        const canReadLocs = userPerms.includes('*') || userPerms.includes('locations.read');

        if (canReadOrg && !orgData) {
          try {
            const orgRes = await api.getOrganization();
            orgData = orgRes.data || orgData;
          } catch {
            // ignore
          }
        }

        if (canReadLocs) {
          try {
            const locRes = await api.getLocations();
            if (locRes.data && locRes.data.length > 0) {
              userLocations = locRes.data;
            }
          } catch {
            // ignore
          }
        }

        set({
          token: savedToken,
          user: u,
          organization: orgData,
          currentLocation: u.location || (userLocations.length > 0 ? userLocations[0] : null),
          locations: userLocations,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    } catch {
      localStorage.removeItem('aos_token');
      localStorage.removeItem('aos_user');
      api.setToken(null);
    }
    set({ isLoading: false });
  },
}));
