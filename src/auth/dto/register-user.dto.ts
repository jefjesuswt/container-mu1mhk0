import { IsEmail, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsPhoneNumber()
  phoneNumber: string;
}
