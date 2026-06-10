import type { UserModel } from '@/shared/prisma/generated/models';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProfileUserMe implements Omit<UserModel, 'sub'> {
  @Expose() id!: number;
  @Expose() nickname!: string;
  @Expose() email!: string;
  @Expose() fullName!: string | null;
  @Expose() description!: string | null;
  @Expose() birthdate!: Date | null;
  @Expose() slug!: string;
  @Expose() avatar!: string | null;
  @Expose() timezone!: string;
  @Expose() soclinks!: Record<string, string> | null;
  @Expose() gameHistory!: Array<unknown>;
  @Expose() isVerified!: boolean;
}

@Exclude()
export class ProfileUserWithId implements Omit<
  UserModel,
  'sub' | 'birthdate' | 'isVerified'
> {
  @Expose() id!: number;
  @Expose() nickname!: string;
  @Expose() email!: string;
  @Expose() fullName!: string | null;
  @Expose() description!: string | null;
  @Expose() slug!: string;
  @Expose() avatar!: string | null;
  @Expose() timezone!: string;
  @Expose() soclinks!: Record<string, string> | null;
  @Expose() gameHistory!: Array<unknown>;
}
