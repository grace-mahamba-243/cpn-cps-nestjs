import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { NutritionEnfantEntity } from './entities/nutrition-enfant.entity';

// Ce module regroupe les composants du suivi nutritionnel enfant.
@Module({
  imports: [TypeOrmModule.forFeature([NutritionEnfantEntity])],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}
