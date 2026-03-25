import { TSucAuthFB, TUser } from '@/shared/types';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class User implements TUser {
  @Expose() id!: number;
  @Expose() nickname!: string;
  @Expose() email!: string;
}

export class LoginResponse {
  user!: User;
  accessToken!: string;
}
