import { LocationsService } from './locations.service';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    getLocations(user: any): Promise<any[]>;
    createLocation(user: any, body: any): Promise<any>;
    getLocation(user: any, id: string): Promise<any>;
    updateLocation(user: any, id: string, body: any): Promise<any>;
    deleteLocation(user: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
