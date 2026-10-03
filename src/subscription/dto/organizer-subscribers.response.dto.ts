import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class OrganizerSubscribersResponseDto {
  @ApiProperty({
    type: [String],
    description: 'ID пользователей, подписанных на организатора',
  })
  @Expose()
  subscriberIds!: string[];
}
