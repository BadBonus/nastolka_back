import type * as T from './index';

declare global {
  namespace PrismaJson {
    type TSoclinksObject = T.TSoclinksObject;
    type TGameHistory = T.TGameHistory;
    type TSubscription = T.TSubscription;
    type TDataAvaCalendar = T.TDataAvaCalendar;
    type TTimezone = T.TTimezone;
    type EAccProviders = T.EAccProviders;
  }
}
