import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class NotificationResponseDto {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  type!: string;

  @ApiProperty()
  @Expose()
  payload!: Record<string, unknown>;

  @ApiProperty()
  @Expose()
  isRead!: boolean;

  @ApiProperty()
  @Expose()
  createdAt!: Date;
}
