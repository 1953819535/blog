import { IsString, IsEmail, IsNotEmpty, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'example@email.com',
    description: '邮箱地址'
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'MyPassword123',
    description: '密码'
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123456',
    description: '验证码'
  })
  code: string;
}