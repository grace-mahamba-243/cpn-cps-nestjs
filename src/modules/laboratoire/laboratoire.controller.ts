import { Controller, Get } from '@nestjs/common';
import { LaboratoireService } from './laboratoire.service';

// Ce controleur expose un point d'entree minimal pour le module laboratoire.
@Controller('laboratoire')
export class LaboratoireController {
  constructor(private readonly laboratoireService: LaboratoireService) {}

  @Get()
  findAll() {
    return this.laboratoireService.findAll();
  }
}
