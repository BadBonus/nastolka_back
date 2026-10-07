import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ESocLinks } from '@pGen/enums';
import { isValidSoclinksObject } from '@/common/soclinks/is-valid-soclink';

@ValidatorConstraint({ name: 'IsSoclinks' })
export class IsSoclinksConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isValidSoclinksObject(value);
  }

  defaultMessage(): string {
    const networks = Object.values(ESocLinks).join(', ');
    return `soclinks: допустимы только ключи ${networks}; значение — https-ссылка на соответствующую соцсеть`;
  }
}

export function IsSoclinks(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsSoclinksConstraint,
    });
  };
}
