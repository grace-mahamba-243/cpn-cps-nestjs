import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CpsFemmeService } from './cps-femme.service';
import { CreerDossierCpsDto } from './dto/creer-dossier-cps.dto';
import { ModifierDossierCpsDto } from './dto/modifier-dossier-cps.dto';
import { CreerVisiteCpsDto } from './dto/creer-visite-cps.dto';
import { ModifierVisiteCpsDto } from './dto/modifier-visite-cps.dto';
import { AnalyserVisiteCpsDto } from './dto/analyser-visite-cps.dto';
import { CreerExamenCpsFemmeDto } from './dto/creer-examen-cps-femme.dto';
import { ModifierExamenCpsFemmeDto } from './dto/modifier-examen-cps-femme.dto';

// Ce controleur expose les endpoints REST du module CPS Femme (suivi postnatal).
@Controller('cps-femme')
export class CpsFemmeController {
  constructor(private readonly cpsFemmeService: CpsFemmeService) {}

  // Recherche de patientes pour l ouverture d un dossier CPS
  @Get('patientes/rechercher')
  rechercherPatientes(@Query('terme') terme: string) {
    return this.cpsFemmeService.rechercherPatientes(terme ?? '');
  }

  // --- Dossiers CPS ---

  @Get()
  listerDossiers(
    @Query('recherche') recherche?: string,
    @Query('patienteId') patienteId?: string,
  ) {
    return this.cpsFemmeService.listerDossiers(recherche, patienteId);
  }

  @Post()
  ouvrirDossier(@Body() dto: CreerDossierCpsDto) {
    return this.cpsFemmeService.ouvrirDossier(dto);
  }

  @Get(':dossierId')
  obtenirDossier(@Param('dossierId') dossierId: string) {
    return this.cpsFemmeService.obtenirDossier(dossierId);
  }

  @Patch(':dossierId')
  modifierDossier(@Param('dossierId') dossierId: string, @Body() dto: ModifierDossierCpsDto) {
    return this.cpsFemmeService.modifierDossier(dossierId, dto);
  }

  // Ajouter un enfant depuis un dossier CPS (hérite des infos de la mère)
  @Post(':dossierId/ajouter-enfant')
  ajouterEnfant(
    @Param('dossierId') dossierId: string,
    @Body() dto: any,
  ) {
    return this.cpsFemmeService.ajouterEnfantDepuisCps(dossierId, dto);
  }

  @Post(':dossierId/cloture')
  cloturerDossier(
    @Param('dossierId') dossierId: string,
    @Body() dto: { closPar: string; notesCloture?: string; utilisateurId?: string; utilisateurNom?: string },
  ) {
    return this.cpsFemmeService.cloturerDossier(dossierId, dto);
  }

  // --- Visites CPS ---

  @Get(':dossierId/visites')
  listerVisites(@Param('dossierId') dossierId: string) {
    return this.cpsFemmeService.listerVisites(dossierId);
  }

  @Post(':dossierId/visites')
  ajouterVisite(@Param('dossierId') dossierId: string, @Body() dto: CreerVisiteCpsDto) {
    return this.cpsFemmeService.ajouterVisite(dossierId, dto);
  }

  @Get(':dossierId/visites/:visiteId')
  obtenirVisite(@Param('dossierId') dossierId: string, @Param('visiteId') visiteId: string) {
    return this.cpsFemmeService.obtenirVisite(dossierId, visiteId);
  }

  @Patch(':dossierId/visites/:visiteId')
  modifierVisite(
    @Param('dossierId') dossierId: string,
    @Param('visiteId') visiteId: string,
    @Body() dto: ModifierVisiteCpsDto,
  ) {
    return this.cpsFemmeService.modifierVisite(dossierId, visiteId, dto);
  }

  // Analyse IA d'une visite postnatale
  @Post(':dossierId/visites/analyser')
  analyserVisite(@Param('dossierId') dossierId: string, @Body() dto: AnalyserVisiteCpsDto) {
    return this.cpsFemmeService.analyserVisite(dossierId, dto);
  }

  // Examens biologiques / échographies du dossier CPS Femme
  @Get(':dossierId/examens')
  listerExamens(@Param('dossierId') dossierId: string) {
    return this.cpsFemmeService.listerExamensCps(dossierId);
  }

  @Post(':dossierId/examens')
  demanderExamen(@Param('dossierId') dossierId: string, @Body() dto: CreerExamenCpsFemmeDto) {
    return this.cpsFemmeService.demanderExamen(dossierId, dto);
  }

  @Patch(':dossierId/examens/:examenId')
  enregistrerResultat(
    @Param('dossierId') dossierId: string,
    @Param('examenId') examenId: string,
    @Body() dto: ModifierExamenCpsFemmeDto,
  ) {
    return this.cpsFemmeService.enregistrerResultatExamen(dossierId, examenId, dto);
  }
}
