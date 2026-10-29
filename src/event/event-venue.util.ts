import { BadRequestException } from '@nestjs/common';
import { EventFormat, GamePlatform, Prisma } from '@pGen/client';
import {
  EventVenueDto,
  EventVenueOfflineDto,
  EventVenueOnlineDto,
  EventVenueType,
} from './dto/event-venue.dto';

export type EventVenueOnline = {
  type: 'ONLINE';
  links: Array<{
    platform: string;
    label?: string;
    url?: string | null;
  }>;
};

export type EventVenueOffline = {
  type: 'OFFLINE';
  address: string;
  lat: number;
  lng: number;
  mapUrl?: string | null;
};

export type EventVenue = EventVenueOnline | EventVenueOffline;

export function assertVenueMatchesFormat(
  format: EventFormat,
  venue: EventVenueDto,
): void {
  if (venue.type !== format) {
    throw new BadRequestException(
      `venue.type (${venue.type}) должен совпадать с format (${format})`,
    );
  }

  if (venue.type === EventVenueType.ONLINE) {
    if (!venue.links?.length) {
      throw new BadRequestException(
        'Для ONLINE venue обязателен непустой массив links',
      );
    }
  }

  if (venue.type === EventVenueType.OFFLINE) {
    if (
      !venue.address ||
      venue.lat === undefined ||
      venue.lng === undefined
    ) {
      throw new BadRequestException(
        'Для OFFLINE venue обязательны address, lat и lng',
      );
    }
  }
}

export function normalizeVenueInput(venue: EventVenueDto): EventVenue {
  if (venue.type === EventVenueType.ONLINE) {
    return {
      type: 'ONLINE',
      links: (venue.links ?? []).map((link) => ({
        platform: link.platform,
        ...(link.label !== undefined ? { label: link.label } : {}),
        url: link.url ?? null,
      })),
    };
  }

  return {
    type: 'OFFLINE',
    address: venue.address!,
    lat: venue.lat!,
    lng: venue.lng!,
    mapUrl: venue.mapUrl ?? null,
  };
}

export function venueToPrismaJson(venue: EventVenue): Prisma.InputJsonValue {
  return venue as unknown as Prisma.InputJsonValue;
}

export function parseEventVenue(raw: unknown): EventVenue {
  if (!raw || typeof raw !== 'object') {
    throw new BadRequestException('Некорректный venue события');
  }

  const v = raw as Record<string, unknown>;

  if (v.type === 'ONLINE') {
    const links = Array.isArray(v.links) ? v.links : [];
    return {
      type: 'ONLINE',
      links: links.map((item) => {
        const link = item as Record<string, unknown>;
        return {
          platform: String(link.platform ?? ''),
          ...(typeof link.label === 'string' ? { label: link.label } : {}),
          url: (link.url as string | null | undefined) ?? null,
        };
      }),
    };
  }

  if (v.type === 'OFFLINE') {
    return {
      type: 'OFFLINE',
      address: String(v.address ?? ''),
      lat: Number(v.lat),
      lng: Number(v.lng),
      mapUrl: (v.mapUrl as string | null | undefined) ?? null,
    };
  }

  throw new BadRequestException('Неизвестный тип venue');
}

export function maskVenueForViewer(
  venue: EventVenue,
  canSeePrivate: boolean,
): EventVenueOnlineDto | EventVenueOfflineDto {
  if (venue.type === 'ONLINE') {
    return {
      type: EventVenueType.ONLINE,
      links: venue.links.map((link) => ({
        platform: link.platform as GamePlatform,
        ...(link.label !== undefined ? { label: link.label } : {}),
        url: canSeePrivate ? (link.url ?? null) : null,
      })),
    };
  }

  return {
    type: EventVenueType.OFFLINE,
    address: venue.address,
    lat: venue.lat,
    lng: venue.lng,
    mapUrl: venue.mapUrl ?? null,
  };
}
