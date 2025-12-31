import { IsString, IsEmail, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱地址不能为空' })
  @ApiProperty({
    example: 'example@email.com',
    description: '邮箱地址'
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @ApiProperty({
    example: 'MyPassword123',
    description: '密码'
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '验证码不能为空' })
  @Length(6, 6, { message: '验证码必须是6位' })
  @ApiProperty({
    example: '123456',
    description: '6位验证码'
  })
  code: string;
}