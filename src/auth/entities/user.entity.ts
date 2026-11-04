import { TUser } from '@/shared/types';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EApiUserRole } from '@/common/enums/roles.enum';

@Exclude()
export class User implements TUser {
  @ApiProperty()
  @Expose()
  id!: string;
  @ApiProperty()
  @Expose()
  nickname!: string;
  @ApiProperty()
  @Expose()
  email!: string;
  @ApiProperty({ type: String, nullable: true })
  @Expose()
  avatar!: string | null;
  @ApiProperty({
    enum: EApiUserRole,
    enumName: 'EApiUserRole',
    isArray: true,
    description: 'Роли пользователя: player | gamemaster | admin | moderator',
  })
  @Expose()
  roles!: EApiUserRole[];
}
