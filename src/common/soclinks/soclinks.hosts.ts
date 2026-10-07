import { ESocLinks } from '@pGen/enums';

export const SOCLINKS_ALLOWED_HOSTS: Record<ESocLinks, readonly string[]> = {
  [ESocLinks.VK]: ['vk.com', 'vk.ru'],
  [ESocLinks.TELEGRAM]: ['t.me', 'telegram.me'],
  [ESocLinks.DISCORD]: ['discord.com', 'discord.gg'],
  [ESocLinks.INSTAGRAM]: ['instagram.com'],
  [ESocLinks.REDDIT]: ['reddit.com'],
  [ESocLinks.YOUTUBE]: ['youtube.com', 'youtu.be', 'm.youtube.com'],
  [ESocLinks.THREADS]: ['threads.net'],
};
