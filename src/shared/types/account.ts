import type { TUser } from './index';
export enum EAccProviders {
  email = 'email',
  google = 'google',
}

export type TSubscription = {
  events: Pick<TUser, 'id'>[];
  gamemasters: Pick<TUser, 'id'>[];
};

export type TSucAuthFB = {
  user: TUser;
  accessToken: string;
};
