import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service'; // Путь может отличаться
import { UploadsService } from '@/common/modules/uploads/uploads.service'; // Путь может отличаться
import { mockDeep } from 'jest-mock-extended';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(), // Использование установленного jest-mock-extended
        },
        {
          provide: UploadsService,
          useValue: {
            // Здесь указываются заглушки для используемых методов UploadsService
            // Например: uploadAvatar: jest.fn().mockResolvedValue('url'),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
