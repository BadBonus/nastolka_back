import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class MySubscriptionsResponseDto {
  @ApiProperty({ type: [String], description: 'ID организаторов, на которых подписан пользователь' })
  @Expose()
  organizerIds!: string[];
}
