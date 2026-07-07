import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

/**
 * Интерфейс для описания диапазонов допустимых размеров изображения
 */
export interface DimensionRange {
  /** Минимально допустимая ширина в пикселях */
  minWidth?: number;
  /** Максимально допустимая ширина в пикселях */
  maxWidth?: number;
  /** Минимально допустимая высота в пикселях */
  minHeight?: number;
  /** Максимально допустимая высота в пикселях */
  maxHeight?: number;
}

/**
 * Тип для конфигурации параметров проверки размеров
 * Может принимать точные значения в виде кортежа [ширина, высота] или объект диапазона размеров
 */
export type ImageDimensionOption = [number, number] | DimensionRange;

/**
 * Пайплайн для проверки геометрических размеров загружаемых изображений
 *
 * @example
 * // Только конкретное точное разрешение
 * new ImageDimensionsPipe([[1920, 1080]])
 *
 * @example
 * // Только зона допустимых значений (квадрат от 200 до 800 пикселей)
 * new ImageDimensionsPipe([{ minWidth: 200, maxWidth: 800, minHeight: 200, maxHeight: 800 }])
 *
 * @example
 * // Только ограничение по минимальной ширине (высота любая)
 * new ImageDimensionsPipe([{ minWidth: 1024 }])
 *
 * @example
 * // Смешанный вариант (разрешен или точный аватар 400x400, или любая картинка шире 1920)
 * new ImageDimensionsPipe([[400, 400], { minWidth: 1920 }])
 */
@Injectable()
export class ImageDimensionsPipe implements PipeTransform {
  /**
   * @param allowedOptions Массив разрешенных конфигураций размеров или диапазонов
   */
  constructor(private readonly allowedOptions: ImageDimensionOption[]) {}

  /**
   * Выполняет извлечение метаданных изображения и их валидацию против заданных правил
   * @param file Объект загруженного файла Express.Multer.File
   * @returns Исходный объект файла при успешном прохождении валидации
   * @throws BadRequestException Если размеры не соответствуют конфигурации или файл не поддается чтению
   */
  async transform(file?: Express.Multer.File) {
    if (!file) {
      return file;
    }

    try {
      const metadata = await sharp(file.buffer).metadata();
      const width = metadata.width;
      const height = metadata.height;

      if (width === undefined || height === undefined) {
        throw new BadRequestException(
          'Не удалось определить размеры изображения',
        );
      }

      const isValid = this.allowedOptions.some((option) => {
        if (Array.isArray(option)) {
          return width === option[0] && height === option[1];
        }

        const matchWidth =
          (option.minWidth === undefined || width >= option.minWidth) &&
          (option.maxWidth === undefined || width <= option.maxWidth);

        const matchHeight =
          (option.minHeight === undefined || height >= option.minHeight) &&
          (option.maxHeight === undefined || height <= option.maxHeight);

        return matchWidth && matchHeight;
      });

      if (!isValid) {
        throw new BadRequestException(
          'Разрешение картинки не соответствует допустимым параметрам',
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
