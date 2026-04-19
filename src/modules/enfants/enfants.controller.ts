import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { EnfantsService } from './enfants.service';
import { CreerEnfantDto } from './dto/creer-enfant.dto';
import { CreerExamenEnfantDto } from './dto/creer-examen-enfant.dto';
import { ModifierExamenEnfantDto } from './dto/modifier-examen-enfant.dto';

// Ce controleur expose les endpoints du module dossiers enfants.
@Controller('enfants')
export class EnfantsController {
  constructor(private readonly enfantsService: EnfantsService) {}

  // Retourne la liste des enfants avec recherche optionnelle.
  @Get()
  findAll(@Query('recherche') recherche?: string) {
    return this.enfantsService.findAll(recherche);
  }

  // Retourne le detail d un enfant par son identifiant.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enfantsService.findOne(id);
  }

  // Retourne le resume complet du dossier enfant (avec suivis, nutritions et doses).
  @Get(':id/resume')
  findResume(@Param('id') id: string) {
    return this.enfantsService.findResume(id);
  }

  // Cree un nouveau dossier enfant.
  @Post()
  creer(@Body() dto: CreerEnfantDto) {
    return this.enfantsService.creer(dto);
  }

  // Retourne la liste des examens d un enfant.
  @Get(':enfantId/examens')
  listerExamens(@Param('enfantId') enfantId: string) {
    return this.enfantsService.listerExamens(enfantId);
  }

  // Demande un nouvel examen pour un enfant.
  @Post(':enfantId/examens')
  demanderExamen(@Param('enfantId') enfantId: string, @Body() dto: CreerExamenEnfantDto) {
    return this.enfantsService.demanderExamen(enfantId, dto);
  }

  // Met a jour le resultat d un examen enfant.
  @Patch(':enfantId/examens/:examenId')
  enregistrerResultat(
    @Param('enfantId') enfantId: string,
    @Param('examenId') examenId: string,
    @Body() dto: ModifierExamenEnfantDto,
  ) {
    return this.enfantsService.enregistrerResultatExamen(enfantId, examenId, dto);
  }
}
