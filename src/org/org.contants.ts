export const ORG_AVATAR_SIZE = [256, 256] as [number, number];
export const PATH_UPLOADED_AVATARS =
  process.env.PATH_UPLOADED_AVATARS_ORG || './uploads/org/avatars';

/** Максимальная длина видимого текста (без HTML-тегов) для description / gameStyleDescr */
export const ORG_RICH_TEXT_MAX_VISIBLE = 5000;
