import { ESocLinks } from '@pGen/enums';
import { SOCLINKS_ALLOWED_HOSTS } from './soclinks.hosts';

const ESOC_LINKS_VALUES = new Set<string>(Object.values(ESocLinks));

export function isESocLinksKey(key: string): key is ESocLinks {
  return ESOC_LINKS_VALUES.has(key);
}

function normalizeHostname(hostname: string): string {
  const lower = hostname.toLowerCase();
  return lower.startsWith('www.') ? lower.slice(4) : lower;
}

export function isValidSoclink(network: ESocLinks, value: string): boolean {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:') {
    return false;
  }

  if (url.username || url.password) {
    return false;
  }

  const pathname = url.pathname.replace(/\/+$/, '');
  if (pathname === '' || pathname === '/') {
    return false;
  }

  const host = normalizeHostname(url.hostname);
  const allowed = SOCLINKS_ALLOWED_HOSTS[network];
  return allowed.includes(host);
}

export function isValidSoclinksObject(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  for (const [key, link] of Object.entries(value as Record<string, unknown>)) {
    if (!isESocLinksKey(key)) {
      return false;
    }
    if (typeof link !== 'string' || !isValidSoclink(key, link)) {
      return false;
    }
  }

  return true;
}
