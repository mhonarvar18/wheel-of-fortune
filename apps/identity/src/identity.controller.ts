import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IdentityService } from './identity.service';

@Controller()
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: { mobile: string; password: string }) {
    return this.identityService.register(data);
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: { mobile: string; password: string }) {
    return this.identityService.login(data);
  }
}
