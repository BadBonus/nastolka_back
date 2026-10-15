import { Module } from '@nestjs/common';
import { EventReviewController } from './event-review.controller';
import { EventReviewService } from './event-review.service';

@Module({
  controllers: [EventReviewController],
  providers: [EventReviewService],
  exports: [EventReviewService],
})
export class EventReviewModule {}
