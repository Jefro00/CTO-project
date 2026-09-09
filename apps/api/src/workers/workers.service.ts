import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class BackgroundWorkersService {
  private readonly logger = new Logger(BackgroundWorkersService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly mediaService: MediaService,
  ) {
    this.startWorkers();
  }

  private startWorkers() {
    this.logger.log('Starting background workers (Retention, Media, Backups, Notifications)');

    // Run retention cleanup every 10 minutes (Section 76)
    setInterval(() => {
      try {
        const res = this.mediaService.runRetentionCleanup();
        if (res.cleanedCount > 0) {
          this.logger.log(`Retention worker cleaned ${res.cleanedCount} expired media files`);
        }
      } catch (err) {
        this.logger.error('Retention worker error:', err);
      }
    }, 10 * 60 * 1000);
  }
}
