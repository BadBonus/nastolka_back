import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NotificationResponseDto } from './notification.response.dto';
import { PaginationMetaDto } from '@common/dto';

export class PaginatedNotificationsResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  @Type(() => NotificationResponseDto)
  data!: NotificationResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
