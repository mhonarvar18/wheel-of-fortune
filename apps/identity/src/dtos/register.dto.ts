import { IsMobilePhone, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsMobilePhone('fa-IR')
  mobile!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  referralCode?: string;
}
