export enum ERole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  ORG = 'ORG',
  MODERATOR = 'MODERATOR',
}

/** Роли в ответах auth (me / refresh / login) */
export enum EApiUserRole {
  PLAYER = 'player',
  GAMEMASTER = 'gamemaster',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

const ROLE_SLUG_TO_API: Record<string, EApiUserRole> = {
  [ERole.USER]: EApiUserRole.PLAYER,
  [ERole.ORG]: EApiUserRole.GAMEMASTER,
  [ERole.ADMIN]: EApiUserRole.ADMIN,
  [ERole.MODERATOR]: EApiUserRole.MODERATOR,
};

export function mapRoleSlugsToApi(
  roles: { slug: string }[] | undefined,
): EApiUserRole[] {
  if (!roles?.length) return [];

  const mapped: EApiUserRole[] = [];
  for (const role of roles) {
    const apiRole = ROLE_SLUG_TO_API[role.slug];
    if (apiRole) mapped.push(apiRole);
  }
  return mapped;
}
