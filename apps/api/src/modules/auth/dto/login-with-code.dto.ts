import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length, IsString } from 'class-validator';

export class LoginWithCodeDto {
  @ApiProperty({
    description: '用户邮箱',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱地址不能为空' })
  email: string;

  @ApiProperty({
    description: '6位验证码',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  @Length(6, 6, { message: '验证码必须是6位' })
  code: string;
}