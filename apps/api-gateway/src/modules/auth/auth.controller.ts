import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: { mobile: string; password: string; referralCode: string }) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: { mobile: string; password: string }) {
    return this.authService.login(dto);
  }
}
