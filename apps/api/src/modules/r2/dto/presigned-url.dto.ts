import { IsNotEmpty, IsString, Matches } from 'class-validator';

/**
 * DTO (Data Transfer Object) 用于验证获取预签名 URL 请求的 body。
 * 这确保了前端传递的数据是合法的。
 */
export class PresignedUrlDto {
  // @IsNotEmpty() 验证该字段不能为空
  @IsNotEmpty()
  // @IsString() 验证该字段必须是字符串
  @IsString()
  // @Matches() 使用正则表达式验证文件名必须以指定的图片后缀结尾
  @Matches(/\.(jpg|jpeg|png|webp)$/i, {
    message: 'Filename must end with .jpg, .jpeg, .png, or .webp',
  })
  filename: string;
}