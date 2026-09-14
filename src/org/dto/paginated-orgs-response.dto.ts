import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '@/common/dto';
import { OrgListResponseDto } from './org-me.response.dto';

export class PaginatedOrgsResponseDto {
  @ApiProperty({ type: [OrgListResponseDto] })
  data!: OrgListResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
