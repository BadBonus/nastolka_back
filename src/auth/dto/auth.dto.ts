import { IsEmail, IsString, MinLength, Length } from 'class-validator';

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

export class VerifyEmailDto {
  @IsEmail({}, { message: 'Некорректный формат email' })
  email!: string;

  @IsString()
  @Length(6, 6, { message: 'Код должен состоять из 6 символов' })
  code!: string;
}
