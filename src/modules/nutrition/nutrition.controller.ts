import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { CreerNutritionEnfantDto } from './dto/creer-nutrition-enfant.dto';

// Ce controleur expose les endpoints du module nutrition enfant.
@Controller('enfants')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  // Retourne l historique nutritionnel d un enfant.
  @Get(':enfantId/nutritions')
  findByEnfant(@Param('enfantId') enfantId: string) {
    return this.nutritionService.findByEnfant(enfantId);
  }

  // Retourne le detail d une evaluation nutritionnelle.
  @Get('nutritions/:id')
  findOne(@Param('id') id: string) {
    return this.nutritionService.findOne(id);
  }

  // Enregistre une nouvelle evaluation nutritionnelle.
  @Post(':enfantId/nutritions')
  creer(@Param('enfantId') enfantId: string, @Body() dto: CreerNutritionEnfantDto) {
    return this.nutritionService.creer({ ...dto, enfantId });
  }
}
