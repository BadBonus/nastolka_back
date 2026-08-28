import { permission, type AppPermission } from './../enums/permissions.enum';
import { ERole } from './../enums/roles.enum';

export const permissions: Partial<Record<ERole, AppPermission[]>> = {
  [ERole.ADMIN]: Object.values(permission),
  [ERole.ORG]: [
    permission.EVENT_CREATE,
    permission.EVENT_MANAGE,
    permission.EVENT_USER_MANAGE,
  ],
  [ERole.USER]: [],
};

export { AppPermission };
