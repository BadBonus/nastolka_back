import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class MyEventFavoritesResponseDto {
  @ApiProperty({
    type: [String],
    description: 'ID событий в избранном текущего пользователя',
  })
  @Expose()
  eventIds!: string[];
}
