export const TELEGRAM_NOTIFICATIONS_QUEUE = 'telegram-notifications';

export type TelegramNotificationJobType =
  | 'event.created'
  | 'event.updated'
  | 'event.cancelled';

export type TelegramNotificationJobData = {
  type: TelegramNotificationJobType;
  event: {
    id: string;
    orgId: string;
    name: string;
    slug: string;
    status: string;
    startsAt: string;
    endsAt: string;
    cancelReason?: string | null;
  };
  recipientIds: string[];
};
