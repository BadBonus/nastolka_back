import { TUser } from '@/shared/types';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class User implements TUser {
  @Expose() id!: number;
  @Expose() nickname!: string;
  @Expose() email!: string;
  @Expose() avatar!: string | null;
}
