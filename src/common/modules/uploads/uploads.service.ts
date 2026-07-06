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
    pathToSave = process.env.DEFAULT_PATH_UPLOADED,
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
}
