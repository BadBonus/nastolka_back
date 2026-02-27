import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {TokenService} from '@/shared/token/token.service';
import {WEEK_IN_MS} from "@/utils/vars";
import type { TSucAuthFB } from '@shared/types';

type TSucAuthFBWithRefresh = TSucAuthFB & { refreshToken: string };


@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService
  ){}

  async createSession (user: {
    id: number;
    email: string;
    nickname: string;
  }) {
    return await this.prisma.$transaction(async (tx) => {
          const {accessToken, refreshToken} = await this.tokenService.generateTokens(user.id);
    
          await tx.session.create({
            data: {
              userId: user.id,
              refreshToken: refreshToken,
              expiresAt: new Date(Date.now() + WEEK_IN_MS), 
            },
          });
          
          return {
            user,
            accessToken,
            refreshToken,
          } as TSucAuthFBWithRefresh;
    });
  }
}