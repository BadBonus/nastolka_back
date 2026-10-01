import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelEventDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cancelReason?: string;
}
