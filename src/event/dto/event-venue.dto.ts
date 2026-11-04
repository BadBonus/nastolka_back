import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GamePlatform } from '@pGen/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export enum EventVenueType {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export class EventVenueLinkDto {
  @ApiProperty({ enum: GamePlatform, enumName: 'GamePlatform' })
  @IsEnum(GamePlatform)
  platform!: GamePlatform;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'URL платформы. В detail для гостя/незаписанного всегда null',
  })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsUrl({ require_protocol: true })
  url?: string | null;
}

export class EventVenueOnlineDto {
  @ApiProperty({ enum: [EventVenueType.ONLINE] })
  @IsEnum(EventVenueType)
  type!: EventVenueType.ONLINE;

  @ApiProperty({ type: [EventVenueLinkDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EventVenueLinkDto)
  links!: EventVenueLinkDto[];
}

export class EventVenueOfflineDto {
  @ApiProperty({ enum: [EventVenueType.OFFLINE] })
  @IsEnum(EventVenueType)
  type!: EventVenueType.OFFLINE;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  address!: string;

  @ApiProperty({ description: 'Широта для карты' })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  lat!: number;

  @ApiProperty({ description: 'Долгота для карты' })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  lng!: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsUrl({ require_protocol: true })
  mapUrl?: string | null;
}

/** Входной venue: ONLINE links | OFFLINE geo. type должен совпадать с format события. */
export class EventVenueDto {
  @ApiProperty({ enum: EventVenueType })
  @IsEnum(EventVenueType)
  type!: EventVenueType;

  @ApiPropertyOptional({ type: [EventVenueLinkDto] })
  @ValidateIf((o: EventVenueDto) => o.type === EventVenueType.ONLINE)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EventVenueLinkDto)
  links?: EventVenueLinkDto[];

  @ApiPropertyOptional()
  @ValidateIf((o: EventVenueDto) => o.type === EventVenueType.OFFLINE)
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: EventVenueDto) => o.type === EventVenueType.OFFLINE)
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  lat?: number;

  @ApiPropertyOptional()
  @ValidateIf((o: EventVenueDto) => o.type === EventVenueType.OFFLINE)
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  lng?: number;

  @ApiPropertyOptional({ nullable: true })
  @ValidateIf(
    (o: EventVenueDto) =>
      o.type === EventVenueType.OFFLINE &&
      o.mapUrl !== null &&
      o.mapUrl !== undefined,
  )
  @IsUrl({ require_protocol: true })
  mapUrl?: string | null;
}
