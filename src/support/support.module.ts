import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RoomManagerService } from './support.roomManager.service';
import { MessageBatchService } from './support.messageBatch.service';
import { SupportGateway } from './support.gateway';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [RoomManagerService, MessageBatchService, SupportGateway],
})
export class SupportModule {}
