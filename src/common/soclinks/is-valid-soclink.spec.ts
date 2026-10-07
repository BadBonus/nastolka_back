import { ESocLinks } from '@pGen/enums';
import {
  isValidSoclink,
  isValidSoclinksObject,
} from './is-valid-soclink';

describe('isValidSoclink', () => {
  it.each([
    [ESocLinks.VK, 'https://vk.com/id1'],
    [ESocLinks.VK, 'https://www.vk.ru/club1'],
    [ESocLinks.TELEGRAM, 'https://t.me/username'],
    [ESocLinks.TELEGRAM, 'https://telegram.me/username'],
    [ESocLinks.DISCORD, 'https://discord.com/users/1'],
    [ESocLinks.DISCORD, 'https://discord.gg/invite'],
    [ESocLinks.INSTAGRAM, 'https://instagram.com/user'],
    [ESocLinks.REDDIT, 'https://reddit.com/u/user'],
    [ESocLinks.REDDIT, 'https://www.reddit.com/r/games'],
    [ESocLinks.YOUTUBE, 'https://youtube.com/@channel'],
    [ESocLinks.YOUTUBE, 'https://youtu.be/abc123'],
    [ESocLinks.YOUTUBE, 'https://m.youtube.com/@channel'],
    [ESocLinks.THREADS, 'https://threads.net/@user'],
    [ESocLinks.THREADS, 'https://www.threads.net/@user'],
  ] as const)('accepts valid %s url %s', (network, url) => {
    expect(isValidSoclink(network, url)).toBe(true);
  });

  it('rejects http protocol', () => {
    expect(isValidSoclink(ESocLinks.VK, 'http://vk.com/id1')).toBe(false);
  });

  it('rejects foreign domain', () => {
    expect(isValidSoclink(ESocLinks.VK, 'https://evil.com/phish')).toBe(false);
  });

  it('rejects userinfo bypass', () => {
    expect(isValidSoclink(ESocLinks.VK, 'https://evil.com@vk.com/id1')).toBe(
      false,
    );
  });

  it('rejects lookalike subdomain', () => {
    expect(isValidSoclink(ESocLinks.VK, 'https://vk.com.evil.com/id1')).toBe(
      false,
    );
  });

  it('rejects empty path', () => {
    expect(isValidSoclink(ESocLinks.VK, 'https://vk.com/')).toBe(false);
    expect(isValidSoclink(ESocLinks.VK, 'https://vk.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidSoclink(ESocLinks.VK, '')).toBe(false);
    expect(isValidSoclink(ESocLinks.VK, '   ')).toBe(false);
  });

  it('rejects mismatched network host', () => {
    expect(isValidSoclink(ESocLinks.VK, 'https://t.me/username')).toBe(false);
  });
});

describe('isValidSoclinksObject', () => {
  it('accepts null and undefined', () => {
    expect(isValidSoclinksObject(null)).toBe(true);
    expect(isValidSoclinksObject(undefined)).toBe(true);
  });

  it('accepts empty object', () => {
    expect(isValidSoclinksObject({})).toBe(true);
  });

  it('accepts valid object', () => {
    expect(
      isValidSoclinksObject({
        VK: 'https://vk.com/id1',
        TELEGRAM: 'https://t.me/user',
        YOUTUBE: 'https://youtube.com/@ch',
        THREADS: 'https://threads.net/@u',
      }),
    ).toBe(true);
  });

  it('rejects unknown key X', () => {
    expect(
      isValidSoclinksObject({
        X: 'https://x.com/user',
      }),
    ).toBe(false);
  });

  it('rejects non-object values', () => {
    expect(isValidSoclinksObject([])).toBe(false);
    expect(isValidSoclinksObject('https://vk.com/id1')).toBe(false);
  });

  it('rejects invalid url for known key', () => {
    expect(
      isValidSoclinksObject({
        VK: 'https://evil.com/phish',
      }),
    ).toBe(false);
  });
});
