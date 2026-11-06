import { Transform } from 'class-transformer';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  getOrgRichHtmlVisibleText,
  sanitizeOrgRichHtml,
} from '@/common/utils/sanitize-org-rich-html';
import { ORG_RICH_TEXT_MAX_VISIBLE } from '@/org/org.contants';

@ValidatorConstraint({ name: 'IsOrgRichHtml' })
export class IsOrgRichHtmlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value !== 'string') {
      return false;
    }

    return (
      getOrgRichHtmlVisibleText(value).length <= ORG_RICH_TEXT_MAX_VISIBLE
    );
  }

  defaultMessage(): string {
    return `Видимый текст HTML-поля не должен превышать ${ORG_RICH_TEXT_MAX_VISIBLE} символов`;
  }
}

/** Санитизирует HTML (allowlist) и проверяет лимит видимого текста. */
export function IsOrgRichHtml(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    Transform(({ value }: { value: unknown }) => {
      if (value === undefined) {
        return undefined;
      }

      if (value === null) {
        return null;
      }

      if (typeof value !== 'string') {
        return value;
      }

      return sanitizeOrgRichHtml(value);
    })(object, propertyName);

    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsOrgRichHtmlConstraint,
    });
  };
}
