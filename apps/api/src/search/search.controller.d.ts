import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(user: any, q: string): Promise<{
        vehicles: any[];
        customers: any[];
        workOrders: any[];
        documents: any[];
    }>;
}
