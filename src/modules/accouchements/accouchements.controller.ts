import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AccouchementsService } from './accouchements.service';
import { CreerAccouchementDto } from './dto/creer-accouchement.dto';

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

  // Detail d un accouchement par son identifiant
  @Get(':accouchementId')
  obtenirAccouchement(@Param('accouchementId') accouchementId: string) {
    return this.accouchementsService.obtenirAccouchement(accouchementId);
  }
}
