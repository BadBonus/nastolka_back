import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class ImgproxyService implements OnModuleInit {
  private keyBuffer!: Buffer;
  private saltBuffer!: Buffer;
  private baseUrl!: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const keyHex = this.configService.getOrThrow<string>('IMGPROXY_KEY');
    const saltHex = this.configService.getOrThrow<string>('IMGPROXY_SALT');
    this.baseUrl = this.configService.get<string>(
      'IMGPROXY_BASE_URL',
      'http://localhost:8079',
    );

    this.keyBuffer = Buffer.from(keyHex, 'hex');
    this.saltBuffer = Buffer.from(saltHex, 'hex');
  }

  generateSignedUrl(src: string, preset: string) {
    const path = `/pr:${preset}/plain/${src}`;
    const hmac = createHmac('sha256', this.keyBuffer);

    hmac.update(this.saltBuffer);
    hmac.update(Buffer.from(path));

    const signature = hmac.digest('base64url');

    return `${this.baseUrl}/${signature}${path}`;
  }
}
