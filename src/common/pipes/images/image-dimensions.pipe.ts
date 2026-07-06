import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ImageDimensionsPipe implements PipeTransform {
  constructor(private readonly allowedSizes: [number, number][]) {}

  async transform(file?: Express.Multer.File) {
    if (!file) {
      return file;
    }

    try {
      const metadata = await sharp(file.buffer).metadata();

      const isSizeAllowed = this.allowedSizes.some(
        ([width, height]) =>
          metadata.width === width && metadata.height === height,
      );

      if (!isSizeAllowed) {
        const sizesString = this.allowedSizes
          .map(([w, h]) => `${w}x${h}`)
          .join(', ');
        throw new BadRequestException(
          `Разрешение картинки должно быть одним из следующих: ${sizesString}`,
        );
      }

      return file;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Не удалось обработать файл изображения');
    }
  }
}
