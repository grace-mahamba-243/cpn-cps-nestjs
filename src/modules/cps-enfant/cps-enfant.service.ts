import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Not, Repository } from 'typeorm';
import { DossierCpsEnfantEntity } from './entities/dossier-cps-enfant.entity';
import { VisiteCpsEnfantEntity } from './entities/visite-cps-enfant.entity';
import { EnfantEntity } from '../enfants/entities/enfant.entity';
import { ExamenCpsEnfantEntity } from './entities/examen-cps-enfant.entity';
import { CreerDossierCpsEnfantDto } from './dto/creer-dossier-cps-enfant.dto';
import { CreerVisiteCpsEnfantDto } from './dto/creer-visite-cps-enfant.dto';
import { CreerExamenCpsEnfantDto } from './dto/creer-examen-cps-enfant.dto';
import { ModifierExamenCpsEnfantDto } from './dto/modifier-examen-cps-enfant.dto';
import { JournalService } from '../journal/journal.service';
import { RendezVousEntity } from '../rendez-vous/entities/rendez-vous.entity';

// Retourne true si le dossier a dépassé 59 mois depuis son ouverture.
function estExpireApres59Mois(dateOuverture: Date | string): boolean {
  if (!dateOuverture) return false;
  const ouverture = new Date(dateOuverture);
  const limite = new Date(ouverture);
  limite.setMonth(limite.getMonth() + 59);
  return new Date() > limite;
}

// Ce service centralise la logique metier du module CPS Enfant (suivi postnatal enfant 0-59 mois).
@Injectable()
export class CpsEnfantService {
  constructor(
    @InjectRepository(DossierCpsEnfantEntity)
    private readonly dossiersRepo: Repository<DossierCpsEnfantEntity>,
    @InjectRepository(VisiteCpsEnfantEntity)
    private readonly visitesRepo: Repository<VisiteCpsEnfantEntity>,
    @InjectRepository(EnfantEntity)
    private readonly enfantsRepo: Repository<EnfantEntity>,
    @InjectRepository(ExamenCpsEnfantEntity)
    private readonly examensRepo: Repository<ExamenCpsEnfantEntity>,
    @InjectRepository(RendezVousEntity)
    private readonly rdvRepo: Repository<RendezVousEntity>,
    private readonly journalService: JournalService,
  ) {}

  // Recherche d enfants pour l ouverture d un dossier.
  async rechercherEnfants(terme: string) {
    if (!terme || terme.trim().length < 2) return { enfants: [] };
    const t = `%${terme.trim()}%`;
    const enfants = await this.enfantsRepo.find({
      where: [
        { nom: Like(t) },
        { postnom: Like(t) },
        { numeroDossier: Like(t) },
      ],
      take: 20,
    });
    return {
      enfants: enfants.map((e) => ({
        id: e.id,
        numeroDossier: e.numeroDossier,
        nom: [e.nom, e.postnom, e.prenom].filter(Boolean).join(' '),
        dateNaissance: e.dateNaissance,
        sexe: e.sexe,
        nomMere: e.nomMere,
      })),
    };
  }

  // Retourne les dossiers CPS Enfant avec recherche optionnelle.
  async listerDossiers(recherche?: string) {
    let dossiers: DossierCpsEnfantEntity[];

    if (recherche && recherche.trim()) {
      const terme = recherche.trim();
      const enfants = await this.enfantsRepo.find({
        where: [
          { nom: Like(`%${terme}%`) },
          { postnom: Like(`%${terme}%`) },
          { numeroDossier: Like(`%${terme}%`) },
        ],
      });
      const ids = enfants.map((e) => e.id);
      if (ids.length === 0) return [];
      dossiers = await Promise.all(
        ids.map((enfantId) =>
          this.dossiersRepo.findOne({ where: { enfantId }, relations: ['enfant', 'visites'] }),
        ),
      ).then((r) => r.filter(Boolean) as DossierCpsEnfantEntity[]);
    } else {
      dossiers = await this.dossiersRepo.find({
        relations: ['enfant', 'visites'],
        order: { creeLe: 'DESC' },
        take: 100,
      });
    }

    return dossiers.map((d) => this.formaterResume(d));
  }

  // Retourne un dossier par ID avec ses visites. Clôture auto si > 59 mois.
  async obtenirDossier(id: string) {
    const dossier = await this.dossiersRepo.findOne({
      where: { id },
      relations: ['enfant', 'visites'],
    });
    if (!dossier) throw new NotFoundException(`Dossier CPS Enfant #${id} introuvable.`);
    // Clôture automatique après 59 mois
    if (dossier.statut === 'OUVERT' && estExpireApres59Mois(dossier.dateOuverture)) {
      dossier.statut = 'CLOS';
      dossier.notes = (dossier.notes ? dossier.notes + '\n' : '') + 'Clôturé automatiquement après 59 mois de suivi.';
      await this.dossiersRepo.save(dossier);
    }
    (dossier.visites ?? []).sort(
      (a, b) => new Date(b.dateVisite).getTime() - new Date(a.dateVisite).getTime(),
    );
    return dossier;
  }

  // Retourne le dossier CPS ouvert d un enfant par son enfantId (null si aucun).
  async dossierParEnfantId(enfantId: string) {
    const dossier = await this.dossiersRepo.findOne({
      where: { enfantId, statut: 'OUVERT' },
      relations: ['enfant', 'visites'],
    });
    return dossier ?? null;
  }

  // Ouvre un nouveau dossier CPS Enfant.
  async ouvrirDossier(dto: CreerDossierCpsEnfantDto) {
    const enfant = await this.enfantsRepo.findOne({ where: { id: dto.enfantId } });
    if (!enfant) throw new NotFoundException(`Enfant #${dto.enfantId} introuvable.`);

    const existant = await this.dossiersRepo.findOne({
      where: { numeroDossierCps: dto.numeroDossierCps },
    });
    if (existant) {
      throw new ConflictException(
        `Le numéro de dossier CPS "${dto.numeroDossierCps}" est déjà utilisé.`,
      );
    }

    const dossierOuvert = await this.dossiersRepo.findOne({
      where: { enfantId: dto.enfantId, statut: 'OUVERT' },
    });
    if (dossierOuvert) {
      throw new ConflictException(
        `Un dossier CPS Enfant ouvert existe déjà pour cet enfant (#${dossierOuvert.numeroDossierCps}).`,
      );
    }

    const entite = this.dossiersRepo.create({
      numeroDossierCps: dto.numeroDossierCps,
      enfantId: dto.enfantId,
      dateOuverture: dto.dateOuverture,
      dateNaissance: dto.dateNaissance ?? enfant.dateNaissance,
      typeAccouchement: dto.typeAccouchement ?? 'INTERNE',
      poidsNaissanceG: dto.poidsNaissanceG ?? null,
      scoreApgar1min: dto.scoreApgar1min ?? null,
      scoreApgar5min: dto.scoreApgar5min ?? null,
      groupeSanguin: dto.groupeSanguin ?? null,
      rhesus: dto.rhesus ?? null,
      vihStatut: dto.vihStatut ?? 'INCONNU',
      mereNom: dto.mereNom ?? null,
      mereTelephone: dto.mereTelephone ?? null,
      notes: dto.notes ?? null,
      statut: 'OUVERT',
      enregistrePar: dto.utilisateurNom ?? null,
    });

    const sauvegarde = await this.dossiersRepo.save(entite);

    const nomEnfant = [enfant.nom, enfant.postnom, enfant.prenom].filter(Boolean).join(' ');
    this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'CREATION',
      module: 'CPS_ENFANT',
      section: 'dossier',
      ressourceId: sauvegarde.id,
      description: `Ouverture du dossier CPS Enfant ${dto.numeroDossierCps} pour ${nomEnfant}.`,
    });

    return sauvegarde;
  }

  // Cloture un dossier CPS Enfant.
  async cloturerDossier(id: string, notes?: string) {
    const dossier = await this.dossiersRepo.findOne({ where: { id } });
    if (!dossier) throw new NotFoundException(`Dossier CPS Enfant #${id} introuvable.`);
    dossier.statut = 'CLOS';
    if (notes) dossier.notes = notes;
    const sauvegarde = await this.dossiersRepo.save(dossier);

    this.journalService.enregistrer({
      typeAction: 'MODIFICATION',
      module: 'CPS_ENFANT',
      section: 'dossier',
      ressourceId: id,
      description: `Clôture du dossier CPS Enfant ${dossier.numeroDossierCps}.`,
      meta: { ancienStatut: 'OUVERT', nouveauStatut: 'CLOS' },
    });

    return sauvegarde;
  }

  async supprimerDossier(id: string) {
    const dossier = await this.dossiersRepo.findOne({ where: { id } });
    if (!dossier) throw new NotFoundException(`Dossier CPS Enfant #${id} introuvable.`);

    const nbVisites = await this.visitesRepo.count({ where: { dossierCpsEnfantId: id } });
    if (nbVisites > 0) {
      throw new BadRequestException('Ce dossier CPS Enfant contient des visites et ne peut pas être supprimé.');
    }

    const nbExamens = await this.examensRepo.count({ where: { dossierId: id } });
    if (nbExamens > 0) {
      throw new BadRequestException('Ce dossier CPS Enfant contient des examens et ne peut pas être supprimé.');
    }

    await this.dossiersRepo.remove(dossier);
    return { message: 'Dossier CPS Enfant supprimé avec succès.' };
  }

  // --- Visites ---

  async listerVisites(dossierCpsEnfantId: string) {
    return this.visitesRepo.find({
      where: { dossierCpsEnfantId },
      order: { dateVisite: 'DESC' },
    });
  }

  async obtenirVisite(id: string) {
    const visite = await this.visitesRepo.findOne({ where: { id } });
    if (!visite) throw new NotFoundException(`Visite CPS Enfant #${id} introuvable.`);
    return visite;
  }

  async creerVisite(dto: CreerVisiteCpsEnfantDto) {
    const dossier = await this.dossiersRepo.findOne({ where: { id: dto.dossierCpsEnfantId } });
    if (!dossier) throw new NotFoundException(`Dossier CPS Enfant #${dto.dossierCpsEnfantId} introuvable.`);
    if (dossier.statut !== 'OUVERT' || estExpireApres59Mois(dossier.dateOuverture)) {
      throw new ConflictException('Ce dossier est clôturé ou a dépassé 59 mois de suivi. Aucune nouvelle visite ne peut être enregistrée.');
    }

    const entite = this.visitesRepo.create({
      dossierCpsEnfantId: dto.dossierCpsEnfantId,
      typeVisite: dto.typeVisite,
      dateVisite: dto.dateVisite,
      ageJours: dto.ageJours ?? null,
      poidsKg: dto.poidsKg ?? null,
      tailleCm: dto.tailleCm ?? null,
      perimetreCranienCm: dto.perimetreCranienCm ?? null,
      temperatureCelsius: dto.temperatureCelsius ?? null,
      frequenceCardiaque: dto.frequenceCardiaque ?? null,
      frequenceRespiratoire: dto.frequenceRespiratoire ?? null,
      etatGeneral: dto.etatGeneral ?? null,
      allaitement: dto.allaitement ?? null,
      priseBiberon: dto.priseBiberon ?? null,
      couleurPeau: dto.couleurPeau ?? null,
      oedemes: dto.oedemes ?? false,
      infectionCutanee: dto.infectionCutanee ?? null,
      ictere: dto.ictere ?? false,
      convulsions: dto.convulsions ?? false,
      etatCordon: dto.etatCordon ?? null,
      developpementPsychomoteur: dto.developpementPsychomoteur ?? null,
      vaccinsAdministres: dto.vaccinsAdministres ?? null,
      motif: dto.motif ?? null,
      diagnostics: dto.diagnostics ?? null,
      conduiteATenir: dto.conduiteATenir ?? null,
      traitementPrescrit: dto.traitementPrescrit ?? null,
      prochainRdvDate: dto.prochainRdvDate ?? null,
      prochainTypeVisite: dto.prochainTypeVisite ?? null,
      agentSante: dto.agentSante ?? null,
      observations: dto.observations ?? null,
      enregistrePar: dto.utilisateurNom ?? null,
    });

    const sauvegarde = await this.visitesRepo.save(entite);

    this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'CREATION',
      module: 'CPS_ENFANT',
      section: 'visite',
      ressourceId: sauvegarde.id,
      description: `Enregistrement d'une visite ${dto.typeVisite} pour le dossier CPS Enfant #${dto.dossierCpsEnfantId}.`,
      meta: { typeVisite: dto.typeVisite, dateVisite: dto.dateVisite },
    });

    // Créer automatiquement un rendez-vous EN_ATTENTE si une date de prochain RDV est définie
    if (dto.prochainRdvDate) {
      try {
        const existant = await this.rdvRepo.findOne({
          where: { refDossier: dossier.numeroDossierCps, dateRdv: dto.prochainRdvDate, statut: Not(In(['ANNULE', 'TERMINE'])) },
        });
        if (!existant) {
          const enfant = dossier.enfantId
            ? await this.enfantsRepo.findOne({ where: { id: dossier.enfantId } })
            : null;
          const nom = enfant
            ? [enfant.nom, enfant.postnom, enfant.prenom].filter(Boolean).join(' ')
            : dossier.mereNom ?? dossier.numeroDossierCps;
          const initiales = nom.trim().split(/\s+/).slice(0, 2).map((m) => m.charAt(0).toUpperCase()).join('') || '?';
          await this.rdvRepo.save(this.rdvRepo.create({
            dateRdv: dto.prochainRdvDate,
            heureRdv: '08:00',
            motif: 'Visite CPS Enfant',
            statut: 'EN_ATTENTE',
            typeRdv: 'PROGRAMME',
            nomPatient: nom,
            initialesPatient: initiales,
            typePatient: 'Enfant',
            refDossier: dossier.numeroDossierCps,
            serviceDestination: 'CPS Enfant',
            creePar: dto.utilisateurNom ?? null,
            enregistrePar: dto.utilisateurNom ?? null,
          }));
        }
      } catch { /* Silencieux : ne pas bloquer la visite si le RDV échoue */ }
    }

    return sauvegarde;
  }

  // --- Formateur résumé ---

  private formaterResume(d: DossierCpsEnfantEntity) {
    const ORDRE_PROTOCOLE = ['SIX_HEURES', 'SIX_JOURS', 'SIX_SEMAINES', 'M2', 'M3', 'M6', 'M9', 'M12'];
    const faites = new Set((d.visites ?? []).map((v) => v.typeVisite));
    const prochaine = ORDRE_PROTOCOLE.find((t) => !faites.has(t)) ?? null;
    const enfant = d.enfant;
    return {
      id: d.id,
      numeroDossierCps: d.numeroDossierCps,
      statut: d.statut,
      dateOuverture: d.dateOuverture,
      nbVisites: (d.visites ?? []).length,
      prochaineVisite: prochaine,
      enfant: enfant
        ? {
            id: enfant.id,
            nom: [enfant.nom, enfant.postnom, enfant.prenom].filter(Boolean).join(' '),
            dateNaissance: enfant.dateNaissance,
            sexe: enfant.sexe,
          }
        : null,
    };
  }

  // --- Examens biologiques / échographies du dossier CPS Enfant ---

  async listerExamens(dossierId: string) {
    const dossier = await this.dossiersRepo.findOne({ where: { id: dossierId } });
    if (!dossier) throw new NotFoundException(`Dossier CPS Enfant #${dossierId} introuvable.`);
    const examens = await this.examensRepo.find({
      where: { dossierId },
      order: { creeLe: 'DESC' },
    });
    return examens.map((e) => this.formaterExamen(e));
  }

  async demanderExamen(dossierId: string, dto: CreerExamenCpsEnfantDto) {
    const dossier = await this.dossiersRepo.findOne({ where: { id: dossierId } });
    if (!dossier) throw new NotFoundException(`Dossier CPS Enfant #${dossierId} introuvable.`);
    if (dossier.statut !== 'OUVERT' || estExpireApres59Mois(dossier.dateOuverture)) {
      throw new ConflictException('Ce dossier est clôturé ou a dépassé 59 mois de suivi. Aucun examen ne peut être demandé.');
    }
    const examen = this.examensRepo.create({
      dossierId,
      typeExamen: dto.typeExamen,
      libelle: dto.libelle,
      source: dto.source ?? 'INTERNE',
      dateExamen: dto.dateExamen ?? null,
      notes: dto.notes ?? null,
      statut: 'DEMANDE',
      enregistrePar: dto.utilisateurNom ?? null,
    });
    await this.examensRepo.save(examen);

    this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'CREATION',
      module: 'CPS_ENFANT',
      section: 'examen',
      ressourceId: examen.id,
      description: `Demande d'examen "${dto.libelle}" pour le dossier CPS Enfant #${dossierId}.`,
      meta: { typeExamen: dto.typeExamen, libelle: dto.libelle },
    });

    return this.formaterExamen(examen);
  }

  async enregistrerResultatExamen(dossierId: string, examenId: string, dto: ModifierExamenCpsEnfantDto) {
    const examen = await this.examensRepo.findOne({ where: { id: examenId, dossierId } });
    if (!examen) throw new NotFoundException(`Examen #${examenId} introuvable.`);
    const ancienStatut = examen.statut;
    if (dto.resultat !== undefined) examen.resultat = dto.resultat;
    if (dto.interpretation !== undefined) examen.resultat = dto.interpretation;
    if (dto.statut !== undefined) examen.statut = dto.statut;
    if (dto.dateResultat !== undefined) examen.dateResultat = dto.dateResultat;
    if (dto.notes !== undefined) examen.notes = dto.notes;
    examen.modifiePar = dto.utilisateurNom ?? null;
    await this.examensRepo.save(examen);

    this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'MODIFICATION',
      module: 'CPS_ENFANT',
      section: 'examen',
      ressourceId: examenId,
      description: `Résultat enregistré pour l'examen "${examen.libelle}" du dossier CPS Enfant #${dossierId}.`,
      meta: { ancienStatut, nouveauStatut: examen.statut, resultat: examen.resultat },
    });

    return this.formaterExamen(examen);
  }

  private formaterExamen(e: ExamenCpsEnfantEntity) {
    return {
      id: e.id,
      dossierId: e.dossierId,
      typeExamen: e.typeExamen,
      libelle: e.libelle,
      statut: e.statut,
      source: e.source,
      resultat: e.resultat,
      dateExamen: e.dateExamen,
      dateResultat: e.dateResultat,
      notes: e.notes,
      prisEnChargeLe: e.prisEnChargeLe,
      envoyeLe: e.envoyeLe,
      creeLe: e.creeLe,
      enregistrePar: e.enregistrePar,
      modifiePar: e.modifiePar,
    };
  }
}
