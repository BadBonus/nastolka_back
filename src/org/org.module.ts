import { Module } from '@nestjs/common';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsModule } from '@/common/modules/uploads/uploads.module';
import { ImgproxyModule } from '@/common/modules/imgproxy/imgproxy.module';

@Module({
  imports: [PrismaModule, UploadsModule, ImgproxyModule],
  controllers: [OrgController],
  providers: [OrgService],
  exports: [OrgService],
})
export class OrgModule {}
