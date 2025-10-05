import { IsMobilePhone, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsMobilePhone('fa-IR')
  mobile!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
