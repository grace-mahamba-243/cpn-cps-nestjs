import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SuiviEnfantService } from './suivi-enfant.service';
import { CreerSuiviEnfantDto } from './dto/creer-suivi-enfant.dto';

// Ce controleur expose les endpoints du module suivi clinique enfant.
@Controller('enfants')
export class SuiviEnfantController {
  constructor(private readonly suiviEnfantService: SuiviEnfantService) {}

  // Retourne l historique de suivi d un enfant.
  @Get(':enfantId/suivis')
  findByEnfant(@Param('enfantId') enfantId: string) {
    return this.suiviEnfantService.findByEnfant(enfantId);
  }

  // Retourne le detail d une visite de suivi.
  @Get('suivis/:id')
  findOne(@Param('id') id: string) {
    return this.suiviEnfantService.findOne(id);
  }

  // Enregistre une nouvelle visite de suivi enfant.
  @Post(':enfantId/suivis')
  creer(@Param('enfantId') enfantId: string, @Body() dto: CreerSuiviEnfantDto) {
    return this.suiviEnfantService.creer({ ...dto, enfantId });
  }
}
