import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * Пайп валидации для проверки безопасности и подлинности графических файлов
 *
 * Выполняет низкоуровневый анализ бинарного содержимого файла без полной десериализации
 * Заменяет проверку расширения имени файла на верификацию магических байт (сигнатур)
 * Защищает сервер от загрузки вредоносных скриптов под видом картинок
 */
@Injectable()
export class ImageValidationPipe implements PipeTransform {
  /**
   * Точка входа для трансформации и валидации входящих данных запроса
   *
   * @param file Объект перехваченного файла из оперативной памяти сервера
   * @returns Модифицированный или исходный объект файла для передачи в контроллер
   * @throws {BadRequestException} Генерирует ошибку 400 при отсутствии файла или несовпадении сигнатур
   */

  /**
   * @param {boolean} isOptional Если true, отсутствие файла не приводит к ошибке.
   */
  constructor(private readonly isOptional = false) {}

  transform(file: Express.Multer.File) {
    if (!file || !file.buffer) {
      if (this.isOptional) return file;

      throw new BadRequestException('Файл отсутствует');
    }

    const buffer = file.buffer;

    const isJpeg =
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;

    if (!isJpeg && !isPng) {
      throw new BadRequestException('Разрешены только форматы JPEG и PNG');
    }

    return file;
  }
}
