import { User, Organization, Location } from '@automotive-os/types';
import { AutomotiveApiClient } from '@automotive-os/api-client';
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
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthState>>;
export {};
