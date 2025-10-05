import { Injectable } from '@nestjs/common';

@Injectable()
export class PointsService {
  getHello(): string {
    return 'Hello World!';
  }
}
