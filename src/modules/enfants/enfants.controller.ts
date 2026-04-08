import { Controller, Get } from '@nestjs/common';
import { EnfantsService } from './enfants.service';

// Ce controleur expose un point d'entree minimal pour le module enfants.
@Controller('enfants')
export class EnfantsController {
  constructor(private readonly enfantsService: EnfantsService) {}

  @Get()
  findAll() {
    return this.enfantsService.findAll();
  }
}
