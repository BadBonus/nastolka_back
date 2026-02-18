import argon2 from 'argon2';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '@/drizzle/drizzle.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './../db/schema';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(@Inject(DRIZZLE) private db: PostgresJsDatabase) {}

  async register(dto: RegisterDto) {
    try {
      return await this.db.transaction(async (tx) => {
        console.log('tx is', tx);
        const passwordHash = await argon2.hash(dto.password);
        const slug = this.generateSlug(dto.nickname);

        const [newUser] = await tx
          .insert(schema.users)
          .values({ nickname: dto.nickname, email: dto.email, slug })
          .returning();

        await tx.insert(schema.accounts).values({
          userId: newUser.id,
          provider: 'email',
          providerAccountId: dto.email,

          passwordHash,
        });

        // Генерацию токенов лучше вынести в отдельный JwtService
        const accessToken = '...';
        const refreshToken = '...';

        await tx.insert(schema.sessions).values({
          userId: newUser.id,
          refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        return { user: newUser, accessToken, refreshToken };
      });
    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists or database error');
      }
      throw error;
    }
  }

  private generateSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-');
  }
}
