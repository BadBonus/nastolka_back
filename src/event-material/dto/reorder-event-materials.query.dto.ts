import { ArrayMinSize, IsArray, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderEventMaterialsDto {
  @ApiProperty({
    type: [String],
    description: 'ID материалов в новом порядке',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  ids!: string[];
}
