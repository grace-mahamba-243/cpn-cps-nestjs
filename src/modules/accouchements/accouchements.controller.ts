import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AccouchementsService } from './accouchements.service';
import { CreerAccouchementDto } from './dto/creer-accouchement.dto';
import { ModifierAccouchementDto } from './dto/modifier-accouchement.dto';

// Ce controleur expose les endpoints REST du module accouchements.
@Controller('accouchements')
export class AccouchementsController {
  constructor(private readonly accouchementsService: AccouchementsService) {}

  // Recherche de patientes pour le formulaire d enregistrement
  @Get('patientes/rechercher')
  rechercherPatientes(@Query('terme') terme: string) {
    return this.accouchementsService.rechercherPatientes(terme ?? '');
  }

  // Liste de tous les accouchements avec recherche optionnelle
  @Get()
  listerAccouchements(@Query('recherche') recherche?: string) {
    return this.accouchementsService.listerAccouchements(recherche);
  }

  // Enregistrement d un nouvel accouchement
  @Post()
  enregistrerAccouchement(@Body() dto: CreerAccouchementDto) {
    return this.accouchementsService.enregistrerAccouchement(dto);
  }

  // Modification d un accouchement existant
  @Patch(':accouchementId')
  modifierAccouchement(
    @Param('accouchementId') accouchementId: string,
    @Body() dto: ModifierAccouchementDto,
  ) {
    return this.accouchementsService.modifierAccouchement(accouchementId, dto);
  }

  // Detail d un accouchement par son identifiant
  @Get(':accouchementId')
  obtenirAccouchement(@Param('accouchementId') accouchementId: string) {
    return this.accouchementsService.obtenirAccouchement(accouchementId);
  }

  // Statut des dossiers CPS (femme et enfant) lies a un accouchement
  @Get(':accouchementId/statut-cps')
  obtenirStatutCps(@Param('accouchementId') accouchementId: string) {
    return this.accouchementsService.obtenirStatutCps(accouchementId);
  }
}
