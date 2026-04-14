import { Controller, Get } from '@nestjs/common';
import { RendezVousService } from './rendez-vous.service';

// Ce controleur expose les endpoints du module rendez-vous.
// Il inclut le resume du jour consomme par le tableau de bord de la reception.
@Controller('rendez-vous')
export class RendezVousController {
  constructor(private readonly rendezVousService: RendezVousService) {}

  @Get()
  findAll() {
    return this.rendezVousService.findAll();
  }

  // Retourne les compteurs et les listes du jour pour la vue reception.
  @Get('tableau-de-bord')
  getResumeDuJour() {
    return this.rendezVousService.getResumeDuJour();
  }
}
