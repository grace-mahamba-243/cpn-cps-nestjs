import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, In, Like, Not, Repository } from 'typeorm';
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

    if (filtres?.refDossier) {
      where.refDossier = ILike(`%${filtres.refDossier}%`);
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
  // Leve une ConflictException si le patient a deja un RDV actif ce meme jour.
  async creer(dto: CreerRendezVousDto): Promise<RendezVousEntity> {
    // Contrainte : un seul RDV actif par patient par jour
    if (dto.refDossier && dto.dateRdv) {
      const existant = await this.rendezVousRepository.findOne({
        where: {
          refDossier: dto.refDossier,
          dateRdv: dto.dateRdv,
          statut: Not(In(['ANNULE', 'TERMINE'])),
        },
      });
      if (existant) {
        throw new ConflictException(
          `Ce patient a deja un rendez-vous prevu le ${dto.dateRdv}. Impossible d en creer un second le meme jour.`,
        );
      }
    }

    const entite = this.rendezVousRepository.create({
      dateRdv: dto.dateRdv,
      heureRdv: dto.heureRdv,
      motif: dto.motif,
      statut: dto.statut ?? 'EN_ATTENTE',
      typeRdv: dto.typeRdv ?? 'PROGRAMME',
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

  // Annule un RDV programme et cree un nouveau avec statut ARRIVE pour aujourd hui.
  // Le RDV annule reste en base de donnees et apparait dans l historique.
  async remplacerParArrivee(ancienRdvId: string): Promise<RendezVousEntity> {
    const ancien = await this.findOne(ancienRdvId);

    // Annuler l ancien rendez-vous (reste visible dans l historique)
    ancien.statut = 'ANNULE';
    await this.rendezVousRepository.save(ancien);

    // Creer le nouveau rendez-vous pour aujourd hui avec statut ARRIVE
    const maintenant = new Date();
    const dateAujourdhui = maintenant.toISOString().split('T')[0];
    const heureNow = `${String(maintenant.getHours()).padStart(2, '0')}:${String(maintenant.getMinutes()).padStart(2, '0')}`;

    const nouveau = this.rendezVousRepository.create({
      dateRdv: dateAujourdhui,
      heureRdv: heureNow,
      motif: ancien.motif,
      statut: 'ARRIVE',
      typeRdv: 'PROGRAMME',
      nomPatient: ancien.nomPatient,
      initialesPatient: ancien.initialesPatient,
      typePatient: ancien.typePatient,
      refDossier: ancien.refDossier,
      serviceDestination: ancien.serviceDestination,
      observations: ancien.observations,
      creePar: ancien.creePar,
    });

    return this.rendezVousRepository.save(nouveau);
  }

  // Retourne le resume du jour pour le tableau de bord de la reception.
  async getResumeDuJour(): Promise<ResumeTableauBordReceptionDto> {
    const dateAujourdhui = new Date().toISOString().split('T')[0];

    const rdvDuJour = await this.rendezVousRepository.find({
      where: { dateRdv: dateAujourdhui },
      order: { heureRdv: 'ASC' },
    });

    const arrivees = rdvDuJour.filter(
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
      rdvDuJour: rdvDuJour.length,
      arrivees,
      rdvPlanifies: rdvDuJour.map(formater),
    };
  }
}
