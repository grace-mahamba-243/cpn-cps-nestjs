import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CpsEnfantService } from './cps-enfant.service';
import { CreerDossierCpsEnfantDto } from './dto/creer-dossier-cps-enfant.dto';
import { CreerVisiteCpsEnfantDto } from './dto/creer-visite-cps-enfant.dto';
import { CreerExamenCpsEnfantDto } from './dto/creer-examen-cps-enfant.dto';
import { ModifierExamenCpsEnfantDto } from './dto/modifier-examen-cps-enfant.dto';

// Ce controleur expose les endpoints REST du module CPS Enfant (suivi postnatal enfant 0-59 mois).
@Controller('cps-enfant')
export class CpsEnfantController {
  constructor(private readonly cpsEnfantService: CpsEnfantService) {}

  // Recherche d enfants pour l ouverture d un dossier
  @Get('enfants/rechercher')
  rechercherEnfants(@Query('terme') terme: string) {
    return this.cpsEnfantService.rechercherEnfants(terme ?? '');
  }

  // --- Dossiers CPS Enfant ---

  @Get()
  listerDossiers(@Query('recherche') recherche?: string) {
    return this.cpsEnfantService.listerDossiers(recherche);
  }

  @Post()
  ouvrirDossier(@Body() dto: CreerDossierCpsEnfantDto) {
    return this.cpsEnfantService.ouvrirDossier(dto);
  }

  @Get('par-enfant/:enfantId')
  dossierParEnfantId(@Param('enfantId') enfantId: string) {
    return this.cpsEnfantService.dossierParEnfantId(enfantId);
  }

  @Get(':dossierId')
  obtenirDossier(@Param('dossierId') dossierId: string) {
    return this.cpsEnfantService.obtenirDossier(dossierId);
  }

  @Post(':dossierId/cloture')
  cloturerDossier(
    @Param('dossierId') dossierId: string,
    @Body() dto: { notes?: string },
  ) {
    return this.cpsEnfantService.cloturerDossier(dossierId, dto.notes);
  }

  @Delete(':dossierId')
  supprimerDossier(@Param('dossierId') dossierId: string) {
    return this.cpsEnfantService.supprimerDossier(dossierId);
  }

  // --- Visites CPS Enfant ---

  @Get(':dossierId/visites')
  listerVisites(@Param('dossierId') dossierId: string) {
    return this.cpsEnfantService.listerVisites(dossierId);
  }

  @Post(':dossierId/visites')
  creerVisite(@Param('dossierId') dossierId: string, @Body() dto: CreerVisiteCpsEnfantDto) {
    dto.dossierCpsEnfantId = dossierId;
    return this.cpsEnfantService.creerVisite(dto);
  }

  @Get(':dossierId/visites/:visiteId')
  obtenirVisite(@Param('visiteId') visiteId: string) {
    return this.cpsEnfantService.obtenirVisite(visiteId);
  }

  // --- Examens biologiques / échographies du dossier CPS Enfant ---

  @Get(':dossierId/examens')
  listerExamens(@Param('dossierId') dossierId: string) {
    return this.cpsEnfantService.listerExamens(dossierId);
  }

  @Post(':dossierId/examens')
  demanderExamen(@Param('dossierId') dossierId: string, @Body() dto: CreerExamenCpsEnfantDto) {
    return this.cpsEnfantService.demanderExamen(dossierId, dto);
  }

  @Patch(':dossierId/examens/:examenId')
  enregistrerResultat(
    @Param('dossierId') dossierId: string,
    @Param('examenId') examenId: string,
    @Body() dto: ModifierExamenCpsEnfantDto,
  ) {
    return this.cpsEnfantService.enregistrerResultatExamen(dossierId, examenId, dto);
  }
}
