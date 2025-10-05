import { Controller, Get } from '@nestjs/common';
import { PointsService } from './points.service';

@Controller()
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get()
  getHello(): string {
    return this.pointsService.getHello();
  }
}
