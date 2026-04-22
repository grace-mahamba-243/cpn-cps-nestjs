import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, In, Like, Not, Repository } from 'typeorm';
import { RendezVousEntity } from './entities/rendez-vous.entity';
import { ResumeTableauBordReceptionDto } from './dto/resume-tableau-bord-reception.dto';
import { CreerRendezVousDto } from './dto/creer-rendez-vous.dto';
import { MettreAJourStatutDto } from './dto/mettre-a-jour-statut.dto';
import { FiltresListeRendezVousDto } from './dto/filtres-liste-rendez-vous.dto';
import { JournalService } from '../journal/journal.service';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { ContactCpnEntity } from '../cpn/entities/contact-cpn.entity';
import { DossierCpsFemmeEntity } from '../cps-femme/entities/dossier-cps-femme.entity';
import { VisiteCpsFemmeEntity } from '../cps-femme/entities/visite-cps-femme.entity';
import { DossierCpsEnfantEntity } from '../cps-enfant/entities/dossier-cps-enfant.entity';
import { VisiteCpsEnfantEntity } from '../cps-enfant/entities/visite-cps-enfant.entity';

// Ce service centralise la logique metier du module rendez-vous.
// Il gere le CRUD complet ainsi que le resume du jour pour le tableau de bord de la reception.
@Injectable()
export class RendezVousService {
  constructor(
    @InjectRepository(RendezVousEntity)
    private readonly rendezVousRepository: Repository<RendezVousEntity>,
    @InjectRepository(DossierCpnEntity)
    private readonly dossierCpnRepository: Repository<DossierCpnEntity>,
    @InjectRepository(ContactCpnEntity)
    private readonly contactCpnRepository: Repository<ContactCpnEntity>,
    @InjectRepository(DossierCpsFemmeEntity)
    private readonly dossierCpsFemmeRepository: Repository<DossierCpsFemmeEntity>,
    @InjectRepository(VisiteCpsFemmeEntity)
    private readonly visiteCpsFemmeRepository: Repository<VisiteCpsFemmeEntity>,
    @InjectRepository(DossierCpsEnfantEntity)
    private readonly dossierCpsEnfantRepository: Repository<DossierCpsEnfantEntity>,
    @InjectRepository(VisiteCpsEnfantEntity)
    private readonly visiteCpsEnfantRepository: Repository<VisiteCpsEnfantEntity>,
    private readonly journalService: JournalService,
  ) {}

  private obtenirDateLocaleIso(): string {
    const maintenant = new Date();
    const annee = maintenant.getFullYear();
    const mois = String(maintenant.getMonth() + 1).padStart(2, '0');
    const jour = String(maintenant.getDate()).padStart(2, '0');
    return `${annee}-${mois}-${jour}`;
  }

  private async synchroniserSourceDepuisRendezVous(rdv: RendezVousEntity, ancienneDate?: string): Promise<void> {
    if (!rdv.refDossier || !rdv.dateRdv) return;

    // CPN
    if (rdv.serviceDestination === 'Maternite (CPN)' || rdv.motif === 'Contact CPN') {
      const dossier = await this.dossierCpnRepository.findOne({ where: { numeroDossierCpn: rdv.refDossier } });
      if (!dossier) return;
      const contactCible = await this.contactCpnRepository.findOne({
        where: {
          dossierCpnId: dossier.id,
          ...(ancienneDate ? { prochainRdvDate: ancienneDate } : {}),
        },
        order: { creeLe: 'DESC' },
      });

      const contactFallback = !contactCible
        ? await this.contactCpnRepository.findOne({
            where: { dossierCpnId: dossier.id },
            order: { creeLe: 'DESC' },
          })
        : null;

      const contact = contactCible ?? contactFallback;
      if (contact) {
        contact.prochainRdvDate = rdv.dateRdv;
        await this.contactCpnRepository.save(contact);
      }
      return;
    }

    // CPS Femme
    if (rdv.serviceDestination === 'CPS Femme' || rdv.motif === 'Visite CPS Femme') {
      const dossier = await this.dossierCpsFemmeRepository.findOne({ where: { numeroDossierCps: rdv.refDossier } });
      if (!dossier) return;
      const visiteCible = await this.visiteCpsFemmeRepository.findOne({
        where: {
          dossierCpsId: dossier.id,
          ...(ancienneDate ? { prochainRdvDate: ancienneDate } : {}),
        },
        order: { creeLe: 'DESC' },
      });

      const visiteFallback = !visiteCible
        ? await this.visiteCpsFemmeRepository.findOne({
            where: { dossierCpsId: dossier.id },
            order: { creeLe: 'DESC' },
          })
        : null;

      const visite = visiteCible ?? visiteFallback;
      if (visite) {
        visite.prochainRdvDate = rdv.dateRdv;
        await this.visiteCpsFemmeRepository.save(visite);
      }
      return;
    }

    // CPS Enfant
    if (rdv.serviceDestination === 'CPS Enfant' || rdv.motif === 'Visite CPS Enfant') {
      const dossier = await this.dossierCpsEnfantRepository.findOne({ where: { numeroDossierCps: rdv.refDossier } });
      if (!dossier) return;
      const visiteCible = await this.visiteCpsEnfantRepository.findOne({
        where: {
          dossierCpsEnfantId: dossier.id,
          ...(ancienneDate ? { prochainRdvDate: ancienneDate } : {}),
        },
        order: { creeLe: 'DESC' },
      });

      const visiteFallback = !visiteCible
        ? await this.visiteCpsEnfantRepository.findOne({
            where: { dossierCpsEnfantId: dossier.id },
            order: { creeLe: 'DESC' },
          })
        : null;

      const visite = visiteCible ?? visiteFallback;
      if (visite) {
        visite.prochainRdvDate = rdv.dateRdv;
        await this.visiteCpsEnfantRepository.save(visite);
      }
    }
  }

  private async annulerDoublonsActifs(rdvCourant: RendezVousEntity, utilisateurNom?: string | null): Promise<void> {
    if (!rdvCourant.refDossier || !rdvCourant.serviceDestination || !rdvCourant.motif) return;

    const doublons = await this.rendezVousRepository.find({
      where: {
        refDossier: rdvCourant.refDossier,
        serviceDestination: rdvCourant.serviceDestination,
        motif: rdvCourant.motif,
        statut: Not(In(['ANNULE', 'TERMINE'])),
      },
    });

    const aAnnuler = doublons.filter((r) => r.id !== rdvCourant.id);
    if (aAnnuler.length === 0) return;

    for (const d of aAnnuler) {
      d.statut = 'ANNULE';
      d.modifiePar = utilisateurNom ?? null;
    }

    await this.rendezVousRepository.save(aAnnuler);
  }

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
      enregistrePar: dto.utilisateurNom ?? null,
    });
    const sauvegarde = await this.rendezVousRepository.save(entite);

    this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'CREATION',
      module: 'RENDEZ_VOUS',
      section: 'rendez-vous',
      ressourceId: sauvegarde.id,
      description: `Création d'un rendez-vous pour ${dto.nomPatient} le ${dto.dateRdv} à ${dto.heureRdv}.`,
      meta: { motif: dto.motif, serviceDestination: dto.serviceDestination },
    });

    return sauvegarde;
  }

  // Reprogramme un rendez-vous en modifiant sa date et son heure, puis passe le statut a REPROGRAMME.
  async reprogrammer(id: string, dateRdv: string, heureRdv: string): Promise<RendezVousEntity> {
    const rdv = await this.findOne(id);
    const ancienneDate = rdv.dateRdv;
    const ancienneHeure = rdv.heureRdv;
    rdv.dateRdv = dateRdv;
    rdv.heureRdv = heureRdv;
    rdv.statut = 'REPROGRAMME';
    const sauvegarde = await this.rendezVousRepository.save(rdv);

    // S'assurer qu'il ne reste qu'un seul RDV actif pour ce dossier/service/motif.
    await this.annulerDoublonsActifs(sauvegarde, rdv.modifiePar ?? rdv.creePar ?? null);

    // Propager la nouvelle date dans la source métier (CPN / CPS femme / CPS enfant).
    await this.synchroniserSourceDepuisRendezVous(sauvegarde, ancienneDate);

    this.journalService.enregistrer({
      typeAction: 'MODIFICATION',
      module: 'RENDEZ_VOUS',
      section: 'rendez-vous',
      ressourceId: id,
      description: `Reprogrammation du rendez-vous de ${rdv.nomPatient} du ${ancienneDate} au ${dateRdv}.`,
      meta: { ancienneDate, ancienneHeure, nouvelleDate: dateRdv, nouvelleHeure: heureRdv },
    });

    return sauvegarde;
  }

  // Met a jour le statut d un rendez-vous (ex: ARRIVE lors de l enregistrement de presenceen accueil).
  async mettreAJourStatut(id: string, dto: MettreAJourStatutDto): Promise<RendezVousEntity> {
    const rdv = await this.findOne(id);
    const ancienStatut = rdv.statut;
    rdv.statut = dto.statut;
    rdv.modifiePar = dto.utilisateurNom ?? null;
    const sauvegarde = await this.rendezVousRepository.save(rdv);

    this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'MODIFICATION',
      module: 'RENDEZ_VOUS',
      section: 'rendez-vous',
      ressourceId: id,
      description: `Changement de statut du rendez-vous de ${rdv.nomPatient} : ${ancienStatut} → ${dto.statut}.`,
      meta: { ancienStatut, nouveauStatut: dto.statut },
    });

    return sauvegarde;
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

    const sauvegarde = await this.rendezVousRepository.save(nouveau);

    this.journalService.enregistrer({
      typeAction: 'MODIFICATION',
      module: 'RENDEZ_VOUS',
      section: 'rendez-vous',
      ressourceId: sauvegarde.id,
      description: `Remplacement du rendez-vous de ${ancien.nomPatient} (${ancien.dateRdv}) par une arrivée le ${dateAujourdhui}.`,
      meta: { ancienRdvId, ancienneDate: ancien.dateRdv, nouveauRdvId: sauvegarde.id },
    });

    return sauvegarde;
  }

  // Retourne le resume du jour pour le tableau de bord de la reception.
  async getResumeDuJour(): Promise<ResumeTableauBordReceptionDto> {
    const dateAujourdhui = this.obtenirDateLocaleIso();

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
