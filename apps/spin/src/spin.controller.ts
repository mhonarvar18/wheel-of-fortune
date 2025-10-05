import { Controller, Get } from '@nestjs/common';
import { SpinService } from './spin.service';

@Controller()
export class SpinController {
  constructor(private readonly spinService: SpinService) {}

}
