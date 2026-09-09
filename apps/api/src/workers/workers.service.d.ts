import { DatabaseService } from '../database/database.service';
import { MediaService } from '../media/media.service';
export declare class BackgroundWorkersService {
    private readonly db;
    private readonly mediaService;
    private readonly logger;
    constructor(db: DatabaseService, mediaService: MediaService);
    private startWorkers;
}
