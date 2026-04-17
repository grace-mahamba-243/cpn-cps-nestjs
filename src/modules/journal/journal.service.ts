import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalActiviteEntity } from './entities/journal-activite.entity';
import { CreerJournalDto } from './dto/creer-journal.dto';

// Ce service permet d'enregistrer et de lister les actions effectuees dans l'application.
@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(JournalActiviteEntity)
    private readonly journalRepo: Repository<JournalActiviteEntity>,
  ) {}

  // Enregistre une action dans le journal (ne lance jamais d'exception)
  async enregistrer(dto: CreerJournalDto): Promise<void> {
    try {
      const entree = this.journalRepo.create({
        utilisateurId: dto.utilisateurId ?? null,
        utilisateurNom: dto.utilisateurNom ?? null,
        typeAction: dto.typeAction,
        module: dto.module,
        section: dto.section ?? null,
        ressourceId: dto.ressourceId ?? null,
        description: dto.description,
        meta: dto.meta ? JSON.stringify(dto.meta) : null,
      });
      await this.journalRepo.save(entree);
    } catch {
      // Ne pas bloquer l'operation principale si le journal echoue
    }
  }

  // Liste les entrées du journal avec filtres optionnels
  async lister(filtres?: {
    utilisateurId?: string;
    module?: string;
    typeAction?: string;
    dateDebut?: string;
    dateFin?: string;
    limite?: number;
    page?: number;
  }) {
    const qb = this.journalRepo.createQueryBuilder('j').orderBy('j.cree_le', 'DESC');

    if (filtres?.utilisateurId) {
      qb.andWhere('j.utilisateur_id = :uid', { uid: filtres.utilisateurId });
    }
    if (filtres?.module) {
      qb.andWhere('j.module = :module', { module: filtres.module });
    }
    if (filtres?.typeAction) {
      qb.andWhere('j.type_action = :ta', { ta: filtres.typeAction });
    }
    if (filtres?.dateDebut) {
      qb.andWhere('j.cree_le >= :debut', { debut: filtres.dateDebut });
    }
    if (filtres?.dateFin) {
      qb.andWhere('j.cree_le <= :fin', { fin: filtres.dateFin + ' 23:59:59' });
    }

    const limite = filtres?.limite ?? 50;
    const page = filtres?.page ?? 1;
    qb.take(limite).skip((page - 1) * limite);

    const [items, total] = await qb.getManyAndCount();

    return {
      total,
      page,
      limite,
      items: items.map((e) => ({
        id: e.id,
        utilisateurId: e.utilisateurId,
        utilisateurNom: e.utilisateurNom,
        typeAction: e.typeAction,
        module: e.module,
        section: e.section,
        ressourceId: e.ressourceId,
        description: e.description,
        meta: e.meta ? JSON.parse(e.meta) : null,
        creeLe: e.creeLe,
      })),
    };
  }
}
