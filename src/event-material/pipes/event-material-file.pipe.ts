import {
  PipeTransform,
  Injectable,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import path from 'path';
import {
  EVENT_MATERIAL_ALLOWED_EXTENSIONS,
  EVENT_MATERIAL_ALLOWED_MIME_TYPES,
  EVENT_MATERIAL_MAX_FILE_BYTES,
} from '../event-material.constants';

@Injectable()
export class EventMaterialFilePipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Файл обязателен');
    }

    if (file.size > EVENT_MATERIAL_MAX_FILE_BYTES) {
      throw new PayloadTooLargeException(
        `Размер файла превышает лимит ${EVENT_MATERIAL_MAX_FILE_BYTES} байт`,
      );
    }

    const ext = path
      .extname(file.originalname || '')
      .replace(/^\./, '')
      .toLowerCase();

    if (
      !EVENT_MATERIAL_ALLOWED_EXTENSIONS.includes(
        ext as (typeof EVENT_MATERIAL_ALLOWED_EXTENSIONS)[number],
      )
    ) {
      throw new BadRequestException(
        `Недопустимое расширение файла. Разрешены: ${EVENT_MATERIAL_ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }

    const mime = (file.mimetype || '').toLowerCase();
    if (
      !EVENT_MATERIAL_ALLOWED_MIME_TYPES.includes(
        mime as (typeof EVENT_MATERIAL_ALLOWED_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException(
        `Недопустимый MIME-тип файла: ${file.mimetype || 'unknown'}`,
      );
    }

    return file;
  }
}
