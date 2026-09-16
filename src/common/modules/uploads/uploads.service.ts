import { Injectable } from '@nestjs/common';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs/promises';

const DEFAULT_JPEG_QUALITY = 90;

type OptimizeImageConfig = {
  quality?: number;
  format?: 'jpeg' | 'png';
};

const defaultOptimizeImageConfig: Required<OptimizeImageConfig> = {
  quality: DEFAULT_JPEG_QUALITY,
  format: 'jpeg',
};

@Injectable()
export class UploadsService {
  async optimizeImage(
    buffer: Buffer,
    config: OptimizeImageConfig = {},
  ): Promise<Buffer> {
    const { quality, format } = {
      ...defaultOptimizeImageConfig,
      ...config,
    };

    const image = sharp(buffer);

    return format === 'png'
      ? image.png({ quality }).toBuffer()
      : image.jpeg({ quality }).toBuffer();
  }

  async saveToDisk(
    buffer: Buffer,
    format: 'jpeg' | 'png' = 'jpeg',
    pathToSave = process.env.DEFAULT_PATH_UPLOADED_FOLDER,
  ): Promise<{ fileName: string; relativePath: string }> {
    if (!pathToSave) throw new Error('Путь для сохранения файла не указан');

    await fs.mkdir(pathToSave, { recursive: true });

    const extension = format === 'jpeg' ? 'jpg' : 'png';
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = path.join(pathToSave, fileName);

    await fs.writeFile(filePath, buffer);

    return {
      fileName,
      relativePath: filePath,
    };
  }

  /**
   * Deletes a previously saved file from disk.
   * Signature mirrors `saveToDisk`: takes the file name and the folder it
   * lives in (not a full path), so callers pass the same values they'd
   * pass when saving.
   *
   * Idempotent: a missing file is treated as success, since the desired
   * end state ("file is gone") is already true — callers doing cleanup
   * after a rename/replace shouldn't have to special-case ENOENT.
   */
  async deleteFromDisk(
    fileName: string,
    pathToSave = process.env.DEFAULT_PATH_UPLOADED_FOLDER,
  ): Promise<void> {
    if (!pathToSave) throw new Error('Путь для сохранения файла не указан');

    // Guard against a fileName that escapes the target folder
    // (e.g. "../../etc/passwd"). Generated names are UUID-based so this
    // should never trigger in practice, but it's cheap insurance since
    // this method takes a bare name, not a vetted path.
    const filePath = path.join(pathToSave, fileName);
    if (path.dirname(filePath) !== path.normalize(pathToSave)) {
      throw new Error('Некорректное имя файла');
    }

    try {
      await fs.unlink(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return;
      }
      throw err;
    }
  }
}
