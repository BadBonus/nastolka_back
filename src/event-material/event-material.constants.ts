export const PATH_UPLOADED_EVENTS_MATERIALS =
  process.env.PATH_UPLOADED_EVENTS_MATERIALS || './uploads/events_materials';

export const EVENT_MATERIAL_MAX_FILE_BYTES = Number(
  process.env.EVENT_MATERIAL_MAX_FILE_BYTES || 2 * 1024 * 1024,
);

export const EVENT_MATERIAL_MAX_FILES = 10;
export const EVENT_MATERIAL_MAX_NOTES = 20;
export const EVENT_MATERIAL_MAX_TITLE_LENGTH = 120;
export const EVENT_MATERIAL_MAX_BODY_LENGTH = 4000;

export const EVENT_MATERIAL_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/zip',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'image/png',
  'image/jpeg',
  'text/plain',
] as const;

export const EVENT_MATERIAL_ALLOWED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'zip',
  'rar',
  'png',
  'jpg',
  'jpeg',
  'txt',
] as const;
