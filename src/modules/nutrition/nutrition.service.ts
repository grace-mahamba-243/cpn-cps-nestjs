import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionEnfantEntity } from './entities/nutrition-enfant.entity';
import { CreerNutritionEnfantDto } from './dto/creer-nutrition-enfant.dto';

// Ce service centralise la logique metier du module nutrition enfant.
@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(NutritionEnfantEntity)
    private readonly nutritionRepository: Repository<NutritionEnfantEntity>,
  ) {}

  // Retourne l historique nutritionnel d un enfant trie par date decroissante.
  async findByEnfant(enfantId: string): Promise<NutritionEnfantEntity[]> {
    return this.nutritionRepository.find({
      where: { enfantId },
      order: { dateEvaluation: 'DESC' },
    });
  }

  // Retourne le detail d une evaluation nutritionnelle.
  async findOne(id: string): Promise<NutritionEnfantEntity> {
    const nutrition = await this.nutritionRepository.findOne({ where: { id } });
    if (!nutrition) throw new NotFoundException(`Evaluation nutritionnelle #${id} introuvable.`);
    return nutrition;
  }

  // Enregistre une nouvelle evaluation nutritionnelle.
  async creer(dto: CreerNutritionEnfantDto): Promise<NutritionEnfantEntity> {
    const entite = this.nutritionRepository.create({
      enfantId: dto.enfantId,
      dateEvaluation: dto.dateEvaluation,
      ageMois: dto.ageMois ?? null,
      poidsKg: dto.poidsKg ?? null,
      tailleCm: dto.tailleCm ?? null,
      perimetreBrachialCm: dto.perimetreBrachialCm ?? null,
      statutNutritionnel: dto.statutNutritionnel ?? null,
      zScorePoidsAge: dto.zScorePoidsAge ?? null,
      zScoreTailleAge: dto.zScoreTailleAge ?? null,
      zScorePoidsT: dto.zScorePoidsT ?? null,
      typeAlimentation: dto.typeAlimentation ?? null,
      diversificationDemarree: dto.diversificationDemarree ?? false,
      oedemes: dto.oedemes ?? false,
      priseEnCharge: dto.priseEnCharge ?? null,
      alimentTherapeutique: dto.alimentTherapeutique ?? null,
      observations: dto.observations ?? null,
    });
    return this.nutritionRepository.save(entite);
  }
}
