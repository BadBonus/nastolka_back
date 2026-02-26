import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Укажите корректный email' })
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  nickname!: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Укажите корректный email' })
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
