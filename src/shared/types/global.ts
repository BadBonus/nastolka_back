import { Request } from 'express';
import type { TActiveUser } from '@/auth/types/active-user';
export enum ESocLinks {
  VK = 'vk',
  TELEGRAM = 'telegram',
  DISCORD = 'discord',
  INSTAGRAM = 'instagram',
  X = 'x',
  REDDIT = 'reddit',
}

declare global {
  interface RequestWithUser extends Request {
    user: TActiveUser;
  }
}

export type TSoclinksObject = Partial<Record<ESocLinks, string | undefined>>;
export type TGameHistory = Array<{ id: string; startTime: string }>;
export type TUser = {
  nickname: string;
  email: string;
  id: string;
  avatar?: string | null;
};
