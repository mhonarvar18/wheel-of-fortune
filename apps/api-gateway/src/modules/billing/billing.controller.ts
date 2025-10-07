import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserId } from '../../common/auth-user.decorator';
import { BillingService } from './billing.service';
import type { PurchaseCreateDto } from '@app/common';

@Controller('billing')
@UseGuards(AuthGuard('jwt'))
export class BillingController {
  constructor(private readonly svc: BillingService) {}

  @Post('purchase')
  purchase(@UserId() userId: string, @Body() body: Omit<PurchaseCreateDto, 'userId'>) {
    return this.svc.create({ ...body, userId });
  }

  @Get('status')
  status(@Query('id') purchaseId: string) {
    return this.svc.status(purchaseId);
  }
}
