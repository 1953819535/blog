import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginWithPwdDto {
  @ApiProperty({
    description: '用户邮箱',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsNotEmpty({ message: '邮箱地址不能为空' })
  email: string;

  @ApiProperty({
    description: '用户密码',
    example: 'MyPassword123',
  })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}