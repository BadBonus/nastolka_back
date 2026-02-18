export enum ESocLinks {
  VK = 'vk',
  TELEGRAM = 'telegram',
  DISCORD = 'discord',
  INSTAGRAM = 'instagram',
  X = 'x',
  REDDIT = 'reddit',
}

export type TSoclinksObject = Partial<Record<ESocLinks, string | undefined>>;
export type TGameHistory = Array<{ id: string; startTime: string }>;
export type TUser = {
  nickname: string;
  email: string;
  id: number;
};
