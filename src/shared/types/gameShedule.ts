export enum EDays {
  monday = 'monday',
  tuesday = 'tuesday',
  wednesday = 'wednesday',
  thursday = 'thursday',
  friday = 'friday',
  saturday = 'saturday',
  sunday = 'sunday',
}

export enum ETimePeriods {
  morning = '8-12',
  afternoon = '12-17',
  evening = '17-22',
  night = '22-8',
}

export type TDataAvaCalendar = Partial<Record<EDays, ETimePeriods[]>> | null;
