import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SpinGatewayService } from './spin.service';
import { SpinResult } from 'libs/common/src/types/spin.types';
import { UserId } from '../../common/auth-user.decorator';

@Controller('spin')
export class SpinController {
  constructor(private readonly spinSvc: SpinGatewayService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async execute(@UserId() userId: string): Promise<SpinResult> {
    return this.spinSvc.execute(userId);
  }
}
