import { TUser } from '@/shared/types';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class User implements TUser {
  @ApiProperty()
  @Expose()
  id!: number;
  @ApiProperty()
  @Expose()
  nickname!: string;
  @ApiProperty()
  @Expose()
  email!: string;
  @ApiProperty()
  @Expose()
  avatar!: string | null;
}
