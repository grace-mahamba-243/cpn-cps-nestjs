import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RendezVousService } from './rendez-vous.service';
import { CreerRendezVousDto } from './dto/creer-rendez-vous.dto';
import { MettreAJourStatutDto } from './dto/mettre-a-jour-statut.dto';
import { FiltresListeRendezVousDto } from './dto/filtres-liste-rendez-vous.dto';
import { ReprogrammerRendezVousDto } from './dto/reprogrammer-rendez-vous.dto';

// Ce controleur expose les endpoints du module rendez-vous.
// Il couvre la liste avec filtres, la creation et la mise a jour du statut.
@Controller('rendez-vous')
export class RendezVousController {
  constructor(private readonly rendezVousService: RendezVousService) {}

  // Retourne la liste des rendez-vous avec filtres optionnels (date, statut, typeRdv, recherche).
  @Get()
  findAll(@Query() filtres: FiltresListeRendezVousDto) {
    return this.rendezVousService.findAll(filtres);
  }

  // Retourne les compteurs et les listes du jour pour la vue reception.
  @Get('tableau-de-bord')
  getResumeDuJour() {
    return this.rendezVousService.getResumeDuJour();
  }

  // Retourne le detail d un rendez-vous par son identifiant.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rendezVousService.findOne(id);
  }

  // Cree un nouveau rendez-vous (planifie ou surprise).
  @Post()
  creer(@Body() dto: CreerRendezVousDto) {
    return this.rendezVousService.creer(dto);
  }

  // Met a jour le statut d un rendez-vous (ex: ARRIVE lors de l enregistrement a l accueil).
  @Patch(':id/statut')
  mettreAJourStatut(@Param('id') id: string, @Body() dto: MettreAJourStatutDto) {
    return this.rendezVousService.mettreAJourStatut(id, dto);
  }

  // Reprogramme un rendez-vous en changeant la date et l heure (statut passe a REPROGRAMME).
  @Patch(':id/reprogrammer')
  reprogrammer(@Param('id') id: string, @Body() dto: ReprogrammerRendezVousDto) {
    return this.rendezVousService.reprogrammer(id, dto.dateRdv, dto.heureRdv);
  }

  // Annule un RDV programme et cree immediatement une arrivee pour aujourd hui.
  // Le RDV annule reste en historique.
  @Post(':id/remplacer-par-arrivee')
  remplacerParArrivee(@Param('id') id: string) {
    return this.rendezVousService.remplacerParArrivee(id);
  }
}
