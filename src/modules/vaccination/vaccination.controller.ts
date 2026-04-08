import { Controller, Get } from '@nestjs/common';
import { VaccinationService } from './vaccination.service';

// Ce controleur expose un point d'entree minimal pour le module vaccination.
@Controller('vaccination')
export class VaccinationController {
  constructor(private readonly vaccinationService: VaccinationService) {}

  @Get()
  findAll() {
    return this.vaccinationService.findAll();
  }
}
