import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UploadsModule } from '@/common/modules/uploads/uploads.module';
import { ImgproxyModule } from '@/common/modules/imgproxy/imgproxy.module';

@Module({
  imports: [UploadsModule, ImgproxyModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
