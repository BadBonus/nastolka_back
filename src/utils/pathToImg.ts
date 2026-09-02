// FIXME: потом проверить как орги сохраняют путь к картинке, нужно как-то автоматизировать этот момент с указанием констант, может брать из env как-то и модифицировать их как-то.
export const STORAGE_FOLDERS = {
  avatars: 'uploads/avatars',
  events_preview: 'uploads/events_preview',
  org_avatars: 'uploads/org/avatars',
} as const;

export type TStorageFolder = keyof typeof STORAGE_FOLDERS;

export function buildImagePath(folder: TStorageFolder): string {
  const targetPath = STORAGE_FOLDERS[folder];
  return targetPath.endsWith('/') ? targetPath : `${targetPath}/`;
}
