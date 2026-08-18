import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImgproxyService } from './imgproxy.service';

@Module({
  imports: [ConfigModule],
  providers: [ImgproxyService],
  exports: [ImgproxyService],
})
export class ImgproxyModule {}
