import { Controller, Get } from '@nestjs/common';
import { SuiviEnfantService } from './suivi-enfant.service';

// Ce controleur expose un point d'entree minimal pour le module suivi-enfant.
@Controller('suivi-enfant')
export class SuiviEnfantController {
  constructor(private readonly suiviEnfantService: SuiviEnfantService) {}

  @Get()
  findAll() {
    return this.suiviEnfantService.findAll();
  }
}
