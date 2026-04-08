import { Controller, Get } from '@nestjs/common';
import { RendezVousService } from './rendez-vous.service';

// Ce controleur expose un point d'entree minimal pour le module rendez-vous.
@Controller('rendez-vous')
export class RendezVousController {
  constructor(private readonly rendezVousService: RendezVousService) {}

  @Get()
  findAll() {
    return this.rendezVousService.findAll();
  }
}
