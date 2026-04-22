import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaccinationDoseEntity } from './entities/vaccination-dose.entity';
import { EnregistrerVaccinationDoseDto } from './dto/enregistrer-vaccination-dose.dto';
import { JournalService } from '../journal/journal.service';

// Ce service centralise la logique metier du module vaccination enfant.
@Injectable()
export class VaccinationService {
  constructor(
    @InjectRepository(VaccinationDoseEntity)
    private readonly doseRepository: Repository<VaccinationDoseEntity>,
    private readonly journalService: JournalService,
  ) {}

  // Retourne le calendrier vaccinal d un enfant (toutes les doses) trie par date.
  async findByEnfant(enfantId: string): Promise<VaccinationDoseEntity[]> {
    return this.doseRepository.find({
      where: { enfantId },
      order: { dateAdministration: 'ASC' },
    });
  }

  // Retourne le detail d une dose.
  async findOne(id: string): Promise<VaccinationDoseEntity> {
    const dose = await this.doseRepository.findOne({ where: { id } });
    if (!dose) throw new NotFoundException(`Dose de vaccination #${id} introuvable.`);
    return dose;
  }

  // Enregistre une dose de vaccin administree.
  async enregistrer(dto: EnregistrerVaccinationDoseDto): Promise<VaccinationDoseEntity> {
    const entite = this.doseRepository.create({
      enfantId: dto.enfantId,
      vaccin: dto.vaccin.trim(),
      numeroDose: dto.numeroDose ?? 1,
      dateAdministration: dto.dateAdministration,
      ageMois: dto.ageMois ?? null,
      numeroLot: dto.numeroLot ?? null,
      statut: dto.statut ?? 'ADMINISTREE',
      motifReport: dto.motifReport ?? null,
      prochaineDoseDate: dto.prochaineDoseDate ?? null,
      observations: dto.observations ?? null,
      administrePar: dto.administrePar ?? null,
      enregistrePar: dto.utilisateurNom ?? null,
    });
    const enregistre = await this.doseRepository.save(entite);

    this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'CREATION',
      module: 'VACCINATION',
      section: 'dose',
      ressourceId: enregistre.id,
      description: `Administration du vaccin ${dto.vaccin} (dose ${dto.numeroDose ?? 1}) pour l'enfant #${dto.enfantId}.`,
    });

    return enregistre;
  }
}
