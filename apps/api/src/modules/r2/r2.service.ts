import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException, // 引入 BadRequestException 用于参数校验
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as path from 'path'; // 引入 path 模块用于处理文件名

/**
 * @Injectable() 标记这个类是一个服务, 可以被 NestJS 的依赖注入系统管理。
 * 这个服务是与 Cloudflare R2 交互的核心工具。
 */
@Injectable()
export class R2Service implements OnModuleInit {
  private readonly logger = new Logger(R2Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('R2_BUCKET_NAME');

    this.s3Client = new S3Client({
      endpoint: this.configService.getOrThrow<string>('R2_ENDPOINT_URL'),
      region: 'auto',
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  onModuleInit() {
    this.logger.log(`R2Service initialized. Bucket: ${this.bucketName}`);
  }

  /**
   * 为客户端直接上传文件创建一个有时效的预签名 URL。
   * @param key R2 中对象的完整路径和文件名 (e.g., "temp/users/123/avatar.jpg")
   * @param expiresIn URL 的有效时间（秒），默认为 900 秒 (15 分钟)
   * @returns 一个用于 PUT 请求的预签名 URL
   */
  async createPresignedUploadUrl(key: string, expiresIn = 900): Promise<string> {
    const command = new PutObjectCommand({ Bucket: this.bucketName, Key: key });
    try {
      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.log(`Successfully created presigned URL for key: ${key}`);
      return presignedUrl;
    } catch (error) {
      this.logger.error(`Failed to create presigned URL for key: ${key}`, error);
      throw new InternalServerErrorException('Could not create presigned upload URL.');
    }
  }

  /**
   * 服务端直接上传文件到 R2。
   * @param key R2 中对象的完整路径和文件名 (e.g., "temp/users/123/avatar.jpg")
   * @param buffer 文件的二进制数据
   * @param contentType 文件的 MIME 类型 (e.g., "image/jpeg")
   */
  async uploadFile(key: string, buffer: Buffer, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`Successfully uploaded file to R2. Key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to upload file to R2. Key: ${key}`, error);
      throw new InternalServerErrorException('Could not upload file to R2.');
    }
  }

  /**
   * 确认文件上传，将其从临时位置移动到指定的永久位置。
   * @param tempKey 文件在临时位置的 key (e.g., "temp/users/123/uploads/abc.jpg")
   * @param destinationPath 目标文件夹路径 (e.g., "users/123/avatars")
   * @returns 包含文件在新位置的相对路径 key
   */
  async confirmUpload(
    tempKey: string,
    destinationPath: string,
  ): Promise<{ key: string }> {
    // 1. 参数校验
    if (!tempKey || !tempKey.startsWith('temp/')) {
      throw new BadRequestException('Invalid temporary key for confirmation.');
    }
    // 目标路径不能为空，且不能包含 '..' 等不安全字符
    if (!destinationPath || destinationPath.includes('..')) {
      throw new BadRequestException('Invalid destination path.');
    }

    // 2. 提取文件名并构造新的 Key
    const filename = path.basename(tempKey);
    // R2/S3 使用正斜杠作为路径分隔符，不依赖操作系统
    // 确保 destinationPath 末尾没有斜杠，然后拼接
    const normalizedPath = destinationPath.replace(/\\/g, '/').replace(/\/$/, '');
    const newKey = `${normalizedPath}/${filename}`;

    const copyCommand = new CopyObjectCommand({
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${tempKey}`, // 源文件
      Key: newKey, // 目标文件
    });
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: tempKey,
    });

    try {
      await this.s3Client.send(copyCommand);
      await this.s3Client.send(deleteCommand);

      this.logger.log(`File moved from '${tempKey}' to '${newKey}'`);
      return {
        key: newKey, // 只返回相对路径，由前端拼接域名
      };
    } catch (error) {
      this.logger.error(
        `Failed to confirm upload from '${tempKey}' to '${newKey}'`,
        error,
      );
      throw new InternalServerErrorException('Could not confirm file upload.');
    }
  }

  /**
   * 从 R2 中删除一个文件。
   * @param key 要删除的对象的完整路径和文件名
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({ Bucket: this.bucketName, Key: key });
    try {
      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully from R2. Key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from R2. Key: ${key}`, error);
      throw new InternalServerErrorException('An error occurred while deleting the file.');
    }
  }
}