export const EVENT_DOMAIN_EVENTS = {
  CREATED: 'event.created',
  UPDATED: 'event.updated',
  CANCELLED: 'event.cancelled',
} as const;

export type EventDomainEventType =
  (typeof EVENT_DOMAIN_EVENTS)[keyof typeof EVENT_DOMAIN_EVENTS];

export type EventNotificationPayload = {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  status: string;
  startsAt: Date | string;
  endsAt: Date | string;
  cancelReason?: string | null;
};
