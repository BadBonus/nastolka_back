import {
  IsEmail,
  IsString,
  MinLength,
  Length,
  IsOptional,
} from 'class-validator';
import { Match } from '@/utils/decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { optional } from 'zod';

export class RegisterDto {
  @IsEmail({}, { message: 'Укажите корректный email' })
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @Match('password', { message: 'Пароли должны быть идентичны' })
  confirmPassword!: string;

  @IsString()
  nickname!: string;

  @ApiProperty({ example: 'Europe/Minsk', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Укажите корректный email' })
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class VerifyEmailDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  email!: string;

  @IsString()
  @Length(6, 6, { message: 'Код должен состоять из 6 символов' })
  code!: string;
}

export class ResetPasswordRequestDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
  newPassword!: string;
}
