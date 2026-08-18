export const STORAGE_FOLDERS = {
  avatars: 'uploads/avatars',
} as const;

export type TStorageFolder = keyof typeof STORAGE_FOLDERS;

export function buildImagePath(folder: TStorageFolder): string {
  const targetPath = STORAGE_FOLDERS[folder];
  return targetPath.endsWith('/') ? targetPath : `${targetPath}/`;
}
