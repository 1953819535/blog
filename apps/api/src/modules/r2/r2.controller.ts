import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { R2Service } from '../r2/r2.service.js';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PresignedUrlDto } from './dto/index.js';
import { CurrentUser } from '../../common/index.js';
import type { SafeUser } from '../users/types/index.js';

/**
 * R2 文件存储控制器
 */
@ApiTags('文件存储')
@Controller('r2')
export class R2Controller {
  constructor(private readonly r2Service: R2Service) {}

  @ApiOperation({ summary: '获取预签名上传 URL' })
  @Post('presigned-url')
  async getPresignedUrl(
    @CurrentUser() user: SafeUser,
    @Body() body: PresignedUrlDto,
  ) {
    const userId = user.id;
    const folder = `temp/users/${userId}/uploads`;
    const fileExtension = path.extname(body.filename);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    const presignedUrl = await this.r2Service.createPresignedUploadUrl(key);

    return {
      presignedUrl,
      key,
    };
  }

  @ApiOperation({ summary: '直接上传文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUser() user: SafeUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
          new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png|gif|webp)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = user.id;
    const folder = `temp/users/${userId}/uploads`;
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${uniqueFileName}`;

    await this.r2Service.uploadFile(key, file.buffer, file.mimetype);

    return {
      key,
      filename: uniqueFileName,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
