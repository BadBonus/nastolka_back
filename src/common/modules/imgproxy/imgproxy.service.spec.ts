import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ImgproxyService } from './imgproxy.service';

describe('ImgproxyService', () => {
  let service: ImgproxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImgproxyService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow(key: string) {
              if (key === 'IMGPROXY_KEY') return 'a1b2c3d4e5f6';
              if (key === 'IMGPROXY_SALT') return 'f6e5d4c3b2a1';
            },
            get(key: string, defaultValue: string) {
              return defaultValue;
            },
          },
        },
      ],
    }).compile();

    service = module.get<ImgproxyService>(ImgproxyService);
    service.onModuleInit();

    console.log('sourceBaseUrl =', service['sourceBaseUrl']);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate valid signature', () => {
    const url = service.generateSignedUrl('a4d2538a.png', 'profile_avatar');
    expect(url).toContain('/pr:profile_avatar/plain/a4d2538a.png');
  });
});
