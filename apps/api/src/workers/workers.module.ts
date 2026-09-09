import { Module } from '@nestjs/common';
import { BackgroundWorkersService } from './workers.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  providers: [BackgroundWorkersService],
  exports: [BackgroundWorkersService],
})
export class WorkersModule {}
