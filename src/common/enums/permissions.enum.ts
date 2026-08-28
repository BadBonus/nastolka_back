export const permission = {
  USER_CREATE: 'user-create',
  USER_EDIT: 'user-edit',
  USER_DELETE: 'user-delete',
  ROLES_MANAGE: 'roles-manage',
  EVENT_CREATE: 'event-create',
  EVENT_MANAGE: 'event-manage',
  EVENT_USER_MANAGE: 'event-user-manage',
  ORG_EDIT_ANY: 'org-edit-any',
  ORG_DELETE_ANY: 'org-delete-any',
  ORG_APPROVE: 'org-approve',
  ORG_MODERATE: 'org-moderate',
} as const;

export type AppPermission = (typeof permission)[keyof typeof permission];
