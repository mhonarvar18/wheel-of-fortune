import { Controller, Get } from '@nestjs/common';
import { PrizeService } from './prize.service';

@Controller('api/prizes')
export class PrizeController {
  constructor(private readonly prizeService: PrizeService) {}

  @Get()
  async list() {
    return this.prizeService.list();
  }
}
