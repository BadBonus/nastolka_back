export const allTimezones = Intl.supportedValuesOf('timeZone');
export type TTimezone = (typeof allTimezones)[number];
