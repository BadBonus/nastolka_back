import sanitizeHtml from 'sanitize-html';

const MARK_BACKGROUND_COLOR = '#ffe42b';
const MARK_STYLE = `background-color:${MARK_BACKGROUND_COLOR}`;

const ORG_RICH_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'ul',
    'ol',
    'li',
    'hr',
    'strong',
    'em',
    's',
    'mark',
  ],
  allowedAttributes: {
    mark: ['style'],
  },
  allowedStyles: {
    mark: {
      'background-color': [/^#ffe42b$/i],
    },
  },
  transformTags: {
    mark: () => ({
      tagName: 'mark',
      attribs: {
        style: MARK_STYLE,
      },
    }),
  },
};

/** Извлекает видимый текст из HTML (без тегов). */
export function getOrgRichHtmlVisibleText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [] });
}

/**
 * Санитизирует HTML для description / gameStyleDescr.
 * Пустой или только из пробелов видимый текст → null.
 */
export function sanitizeOrgRichHtml(
  value: string | null | undefined,
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const cleaned = sanitizeHtml(value, ORG_RICH_HTML_OPTIONS);
  const visible = getOrgRichHtmlVisibleText(cleaned).trim();

  if (!visible) {
    return null;
  }

  return cleaned;
}
