import slugify from 'slugify';
import { randomBytes } from 'crypto';

export const createUniqueSlug = (nickname: string): string => {
  const baseSlug = slugify(nickname, { lower: true, strict: true, trim: true });
  const suffix = randomBytes(3).toString('hex');
  return baseSlug ? `${baseSlug}-${suffix}` : suffix;
};
