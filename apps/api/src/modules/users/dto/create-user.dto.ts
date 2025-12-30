import { IsEmail, IsString, IsOptional, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)/, { 
    message: '密码必须包含至少一个字母和一个数字' 
  })
  password: string;

  @IsString()
  @IsOptional()
  nickname?: string;
}