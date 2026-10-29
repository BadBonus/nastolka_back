import { Module } from '@nestjs/common';
import { UploadsModule } from '@/common/modules/uploads/uploads.module';
import { EventMaterialController } from './event-material.controller';
import { EventMaterialService } from './event-material.service';

@Module({
  imports: [UploadsModule],
  controllers: [EventMaterialController],
  providers: [EventMaterialService],
  exports: [EventMaterialService],
})
export class EventMaterialModule {}
