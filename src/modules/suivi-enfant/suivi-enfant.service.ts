import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuiviEnfantEntity } from './entities/suivi-enfant.entity';
import { CreerSuiviEnfantDto } from './dto/creer-suivi-enfant.dto';

// Ce service centralise la logique metier du module suivi clinique enfant.
@Injectable()
export class SuiviEnfantService {
  constructor(
    @InjectRepository(SuiviEnfantEntity)
    private readonly suiviRepository: Repository<SuiviEnfantEntity>,
  ) {}

  // Retourne l historique de suivi d un enfant trie par date decroissante.
  async findByEnfant(enfantId: string): Promise<SuiviEnfantEntity[]> {
    return this.suiviRepository.find({
      where: { enfantId },
      order: { dateVisite: 'DESC' },
    });
  }

  // Retourne le detail d une visite de suivi.
  async findOne(id: string): Promise<SuiviEnfantEntity> {
    const suivi = await this.suiviRepository.findOne({ where: { id } });
    if (!suivi) throw new NotFoundException(`Suivi #${id} introuvable.`);
    return suivi;
  }

  // Enregistre une nouvelle visite de suivi enfant.
  async creer(dto: CreerSuiviEnfantDto): Promise<SuiviEnfantEntity> {
    const entite = this.suiviRepository.create({
      enfantId: dto.enfantId,
      dateVisite: dto.dateVisite,
      ageMois: dto.ageMois ?? null,
      poidsKg: dto.poidsKg ?? null,
      tailleCm: dto.tailleCm ?? null,
      perimetreCranienCm: dto.perimetreCranienCm ?? null,
      perimetreBrachialCm: dto.perimetreBrachialCm ?? null,
      temperatureCelsius: dto.temperatureCelsius ?? null,
      frequenceCardiaque: dto.frequenceCardiaque ?? null,
      frequenceRespiratoire: dto.frequenceRespiratoire ?? null,
      etatGeneral: dto.etatGeneral ?? null,
      couleurPeau: dto.couleurPeau ?? null,
      oedemes: dto.oedemes ?? false,
      deshydratation: dto.deshydratation ?? false,
      developpementPsychomoteur: dto.developpementPsychomoteur ?? null,
      allaitement: dto.allaitement ?? null,
      motif: dto.motif ?? null,
      diagnostics: dto.diagnostics ?? null,
      conduiteATenir: dto.conduiteATenir ?? null,
      traitementPrescrit: dto.traitementPrescrit ?? null,
      prochainRdvDate: dto.prochainRdvDate ?? null,
      observations: dto.observations ?? null,
    });
    return this.suiviRepository.save(entite);
  }
}
