import type { UserModel } from '@/shared/prisma/generated/models';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ScheduleIntervalEntity {
  @ApiProperty({ description: 'День недели (1-7)', example: 1 })
  @Expose()
  dayOfWeek!: number;

  @ApiProperty({ description: 'Время начала', example: 8 })
  @Expose()
  startTime!: number;

  @ApiProperty({ description: 'Время окончания', example: 12 })
  @Expose()
  endTime!: number;
}

@Exclude()
export class ProfileUserMe implements Omit<UserModel, 'sub'> {
  @Expose() id!: number;
  @Expose() nickname!: string;
  @Expose() email!: string;
  @Expose() fullName!: string | null;
  @Expose() description!: string | null;
  @Expose() birthdate!: Date | null;
  @Expose() slug!: string;
  @Expose() avatar!: string | null;
  @Expose() timezone!: string;
  @Expose() soclinks!: Record<string, string> | null;
  @Expose() gameHistory!: Array<unknown>;
  @Expose() isVerified!: boolean;
  @Expose() roleId!: number;
  @ApiProperty({
    type: () => [ScheduleIntervalEntity],
    description: 'Интервалы доступности пользователя',
  })
  @Type(() => ScheduleIntervalEntity)
  @Expose()
  schedules!: ScheduleIntervalEntity[];
}

@Exclude()
export class ProfileUserWithId implements Omit<
  UserModel,
  'sub' | 'birthdate' | 'isVerified' | 'roleId'
> {
  @Expose() id!: number;
  @Expose() nickname!: string;
  @Expose() email!: string;
  @Expose() fullName!: string | null;
  @Expose() description!: string | null;
  @Expose() slug!: string;
  @Expose() avatar!: string | null;
  @Expose() timezone!: string;
  @Expose() soclinks!: Record<string, string> | null;
  @Expose() gameHistory!: Array<unknown>;
}
