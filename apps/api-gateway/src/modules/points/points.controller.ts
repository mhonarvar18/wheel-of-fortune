import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PointsService } from './points.service';
import { UserId } from '../../common/auth-user.decorator';
import type { PointsApplyDto } from '@app/common';

@Controller('points') // ← prefix نذار؛ setGlobalPrefix('api') قبلاً اضافه می‌کنه
@UseGuards(AuthGuard('jwt'))
export class PointsController {
  constructor(private readonly svc: PointsService) {}

  @Get('balance')
  balance(@UserId() userId: string) {
    return this.svc.balance(userId);
  }

  @Get('history')
  history(@UserId() userId: string) {
    return this.svc.history(userId);
  }

  // اختیاری: اگر ادمین بخواهد امتیاز اعمال کند
  @Post('apply')
  apply(@UserId() userId: string, @Body() body: Omit<PointsApplyDto, 'userId'>) {
    return this.svc.apply({ ...body, userId });
  }
}
