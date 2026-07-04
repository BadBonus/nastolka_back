import { ApiProperty } from '@nestjs/swagger';

export class UploadAvatarResponseDto {
  @ApiProperty({ example: 'Файл успешно оптимизирован' })
  message!: string;

  @ApiProperty({ example: 5242880 })
  originalSize!: number;

  @ApiProperty({ example: 1024500 })
  optimizedSize!: number;
}

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
