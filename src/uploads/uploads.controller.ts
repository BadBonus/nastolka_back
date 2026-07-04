import 'multer';
// import {
//   ApiTags,
//   ApiCreatedResponse,
//   ApiOperation,
//   ApiResponse,
//   ApiOkResponse,
//   ApiConsumes,
//   ApiBody,
// } from '@nestjs/swagger';
import {
  Controller,
  // Post,
  // UseInterceptors,
  // UploadedFile,
} from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { ImageValidationPipe } from './image-validation.pipe';
import { UploadsService } from './uploads.service';
// import {
//   FileUploadDto,
//   UploadAvatarResponseDto,
// } from './uploads.controller.types';
// import path from 'path/win32';

const MAX_IMG_SIZE = 5 * 1024 * 1024; // 5 MB

// @ApiTags('Uploads Images')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // @Post('avatar')
  // // @ApiConsumes('multipart/form-data')
  // // @ApiBody({
  // //   description: 'Графический файл формата JPEG или PNG',
  // //   type: FileUploadDto,
  // // })
  // // @ApiOkResponse({
  // //   description: 'Загрузка и обработка аватарки пользователя',
  // //   type: UploadAvatarResponseDto,
  // // })
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     limits: {
  //       fileSize: MAX_IMG_SIZE,
  //     },
  //   }),
  // )
  // async uploadAvatar(
  //   @UploadedFile(ImageValidationPipe) file: Express.Multer.File,
  // ) {
  //   const optimizedBuffer = await this.uploadsService.optimizeImage(
  //     file.buffer,
  //   );

  //   const uploadDir = path.join(process.env.PATH_UPLOADED_AVATARS);

  //   await this.uploadsService.saveToDisk(optimizedBuffer, 'jpeg', uploadDir);

  //   return {
  //     message: 'Файл успешно оптимизирован',
  //     originalSize: file.buffer.length,
  //     optimizedSize: optimizedBuffer.length,
  //   };
  // }
}
