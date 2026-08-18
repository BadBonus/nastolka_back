import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import type { TImgproxyPreset } from '@/common/types/imgproxy-presets.ts';

@Injectable()
export class ImgproxyService implements OnModuleInit {
  private keyBuffer!: Buffer;
  private saltBuffer!: Buffer;
  private baseUrl!: string;
  private sourceBaseUrl!: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const keyHex = this.configService.getOrThrow<string>('IMGPROXY_KEY');
    const saltHex = this.configService.getOrThrow<string>('IMGPROXY_SALT');
    this.baseUrl = this.configService.get<string>(
      'IMGPROXY_BASE_URL',
      'http://localhost:8079',
    );
    this.sourceBaseUrl = this.configService.get<string>(
      'IMAGE_SOURCE_BASE_URL',
      'http://host.docker.internal:4000',
    );

    this.keyBuffer = Buffer.from(keyHex, 'hex');
    this.saltBuffer = Buffer.from(saltHex, 'hex');
  }

  generateSignedUrl(relativePath: string, preset: TImgproxyPreset) {
    const normalizedPath = relativePath.replace(/\\/g, '/').replace(/^\//, '');
    const fullSourceUrl = `${this.sourceBaseUrl}/${normalizedPath}`;
    const encodedSourceUrl = Buffer.from(fullSourceUrl).toString('base64url');

    const path = `/${preset}/${encodedSourceUrl}`;
    const hmac = createHmac('sha256', this.keyBuffer);

    hmac.update(this.saltBuffer);
    hmac.update(Buffer.from(path));

    const signature = hmac.digest('base64url');

    return `${this.baseUrl}/${signature}${path}`;
  }
}
