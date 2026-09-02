import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsModule } from '@/common/modules/uploads/uploads.module';
import { ImgproxyModule } from '@/common/modules/imgproxy/imgproxy.module';

@Module({
  imports: [PrismaModule, UploadsModule, ImgproxyModule],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
