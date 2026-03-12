import { TSucAuthFB, TUser } from '@/shared/types';

class User implements TUser {
  nickname!: string;
  email!: string;
  id!: number;
}

export class LoginResponse {
  user!: User;
  accessToken!: string;
}
