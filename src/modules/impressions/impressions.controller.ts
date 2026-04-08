import { Controller, Get } from '@nestjs/common';
import { ImpressionsService } from './impressions.service';

// Ce controleur expose un point d'entree minimal pour le module impressions.
@Controller('impressions')
export class ImpressionsController {
  constructor(private readonly impressionsService: ImpressionsService) {}

  @Get()
  findAll() {
    return this.impressionsService.findAll();
  }
}
