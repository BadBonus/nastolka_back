import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const ALLOWED_SCHEDULE_SLOTS: ReadonlyArray<readonly [number, number]> = [
  [8, 12],
  [12, 17],
  [17, 22],
  [22, 8],
];

function isAllowedScheduleSlot(startTime: number, endTime: number): boolean {
  return ALLOWED_SCHEDULE_SLOTS.some(
    ([start, end]) => start === startTime && end === endTime,
  );
}

@ValidatorConstraint({ name: 'IsOrgScheduleSlots' })
export class IsOrgScheduleSlotsConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!Array.isArray(value)) {
      return true;
    }

    const seen = new Set<string>();

    for (const item of value) {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const interval = item as {
        dayOfWeek?: unknown;
        startTime?: unknown;
        endTime?: unknown;
      };

      if (
        typeof interval.dayOfWeek !== 'number' ||
        typeof interval.startTime !== 'number' ||
        typeof interval.endTime !== 'number' ||
        !isAllowedScheduleSlot(interval.startTime, interval.endTime)
      ) {
        return false;
      }

      const key = `${interval.dayOfWeek}:${interval.startTime}:${interval.endTime}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
    }

    return true;
  }

  defaultMessage(): string {
    return 'Допустимые слоты: 8–12, 12–17, 17–22, 22–8; один и тот же слот нельзя указать дважды в один день';
  }
}

export function IsOrgScheduleSlots(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsOrgScheduleSlotsConstraint,
    });
  };
}
