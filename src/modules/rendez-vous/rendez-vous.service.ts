import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { RendezVousEntity } from './entities/rendez-vous.entity';
import { ResumeTableauBordReceptionDto } from './dto/resume-tableau-bord-reception.dto';
import { CreerRendezVousDto } from './dto/creer-rendez-vous.dto';
import { MettreAJourStatutDto } from './dto/mettre-a-jour-statut.dto';
import { FiltresListeRendezVousDto } from './dto/filtres-liste-rendez-vous.dto';

// Ce service centralise la logique metier du module rendez-vous.
// Il gere le CRUD complet ainsi que le resume du jour pour le tableau de bord de la reception.
@Injectable()
export class RendezVousService {
  constructor(
    @InjectRepository(RendezVousEntity)
    private readonly rendezVousRepository: Repository<RendezVousEntity>,
  ) {}

  // Retourne la liste des rendez-vous selon les filtres fournis.
  async findAll(filtres?: FiltresListeRendezVousDto): Promise<RendezVousEntity[]> {
    const where: Record<string, unknown> = {};

    if (filtres?.date) {
      where.dateRdv = filtres.date;
    } else if (filtres?.dateDebut && filtres?.dateFin) {
      where.dateRdv = Between(filtres.dateDebut, filtres.dateFin);
    }

    if (filtres?.statut) {
      where.statut = filtres.statut;
    }

    if (filtres?.typeRdv) {
      where.typeRdv = filtres.typeRdv;
    }

    if (filtres?.serviceDestination) {
      where.serviceDestination = Like(`%${filtres.serviceDestination}%`);
    }

    if (filtres?.recherche) {
      const terme = filtres.recherche.trim();
      return this.rendezVousRepository.find({
        where: [
          { ...where, nomPatient: Like(`%${terme}%`) },
          { ...where, refDossier: Like(`%${terme}%`) },
        ],
        order: { dateRdv: 'ASC', heureRdv: 'ASC' },
      });
    }

    return this.rendezVousRepository.find({
      where,
      order: { dateRdv: 'ASC', heureRdv: 'ASC' },
    });
  }

  // Retourne un rendez-vous par son identifiant ou leve une exception 404.
  async findOne(id: string): Promise<RendezVousEntity> {
    const rdv = await this.rendezVousRepository.findOne({ where: { id } });
    if (!rdv) {
      throw new NotFoundException(`Rendez-vous #${id} introuvable.`);
    }
    return rdv;
  }

  // Cree un nouveau rendez-vous a partir du DTO valide.
  async creer(dto: CreerRendezVousDto): Promise<RendezVousEntity> {
    const entite = this.rendezVousRepository.create({
      dateRdv: dto.dateRdv,
      heureRdv: dto.heureRdv,
      motif: dto.motif,
      statut: dto.statut ?? 'EN_ATTENTE',
      typeRdv: dto.typeRdv,
      nomPatient: dto.nomPatient,
      initialesPatient: dto.initialesPatient,
      typePatient: dto.typePatient ?? null,
      refDossier: dto.refDossier ?? null,
      serviceDestination: dto.serviceDestination ?? null,
      observations: dto.observations ?? null,
      creePar: dto.creePar ?? null,
    });
    return this.rendezVousRepository.save(entite);
  }

  // Reprogramme un rendez-vous en modifiant sa date et son heure, puis passe le statut a REPROGRAMME.
  async reprogrammer(id: string, dateRdv: string, heureRdv: string): Promise<RendezVousEntity> {
    const rdv = await this.findOne(id);
    rdv.dateRdv = dateRdv;
    rdv.heureRdv = heureRdv;
    rdv.statut = 'REPROGRAMME';
    return this.rendezVousRepository.save(rdv);
  }

  // Met a jour le statut d un rendez-vous (ex: ARRIVE lors de l enregistrement de presenceen accueil).
  async mettreAJourStatut(id: string, dto: MettreAJourStatutDto): Promise<RendezVousEntity> {
    const rdv = await this.findOne(id);
    rdv.statut = dto.statut;
    return this.rendezVousRepository.save(rdv);
  }

  // Retourne le resume du jour pour le tableau de bord de la reception.
  // Les donnees simulees sont retournees jusqu a ce que la base soit populee.
  async getResumeDuJour(): Promise<ResumeTableauBordReceptionDto> {
    const dateAujourdhui = new Date().toISOString().split('T')[0];

    const [rdvPlanifies, rdvSurprise] = await Promise.all([
      this.rendezVousRepository.find({
        where: { dateRdv: dateAujourdhui, typeRdv: 'PROGRAMME' },
        order: { heureRdv: 'ASC' },
      }),
      this.rendezVousRepository.find({
        where: { dateRdv: dateAujourdhui, typeRdv: 'SURPRISE' },
        order: { heureRdv: 'ASC' },
      }),
    ]);

    const arrivees = rdvPlanifies.filter(
      (rdv) => rdv.statut === 'ARRIVE' || rdv.statut === 'TERMINE',
    ).length;

    const formater = (rdv: RendezVousEntity) => ({
      id: rdv.id,
      nom: rdv.nomPatient,
      initiales: rdv.initialesPatient,
      heure: rdv.heureRdv,
      motif: rdv.motif,
      statut: rdv.statut,
      typeRdv: rdv.typeRdv,
    });

    return {
      rdvDuJour: rdvPlanifies.length,
      arrivees,
      surprises: rdvSurprise.length,
      rdvPlanifies: rdvPlanifies.map(formater),
      rdvSurprise: rdvSurprise.map(formater),
    };
  }
}
