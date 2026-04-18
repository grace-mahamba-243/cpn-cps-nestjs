import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import OpenAI from 'openai';
import { AnalyserVisiteCpsDto } from './dto/analyser-visite-cps.dto';
import { DossierCpsFemmeEntity } from './entities/dossier-cps-femme.entity';
import { VisiteCpsFemmeEntity } from './entities/visite-cps-femme.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { ContactCpnEntity } from '../cpn/entities/contact-cpn.entity';
import { ExamenCpnEntity } from '../cpn/entities/examen-cpn.entity';
import { EnfantEntity } from '../enfants/entities/enfant.entity';
import { CreerDossierCpsDto } from './dto/creer-dossier-cps.dto';
import { ModifierDossierCpsDto } from './dto/modifier-dossier-cps.dto';
import { CreerVisiteCpsDto } from './dto/creer-visite-cps.dto';
import { ModifierVisiteCpsDto } from './dto/modifier-visite-cps.dto';
import { JournalService } from '../journal/journal.service';

// Ce service centralise toute la logique metier du module CPS Femme (suivi postnatal).
@Injectable()
export class CpsFemmeService {
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  constructor(
    @InjectRepository(DossierCpsFemmeEntity)
    private readonly dossiersRepo: Repository<DossierCpsFemmeEntity>,
    @InjectRepository(VisiteCpsFemmeEntity)
    private readonly visitesRepo: Repository<VisiteCpsFemmeEntity>,
    @InjectRepository(PatienteEntity)
    private readonly patientesRepo: Repository<PatienteEntity>,
    @InjectRepository(DossierCpnEntity)
    private readonly dossiersCpnRepo: Repository<DossierCpnEntity>,
    @InjectRepository(ContactCpnEntity)
    private readonly contactsCpnRepo: Repository<ContactCpnEntity>,
    @InjectRepository(ExamenCpnEntity)
    private readonly examensCpnRepo: Repository<ExamenCpnEntity>,
    @InjectRepository(EnfantEntity)
    private readonly enfantsRepo: Repository<EnfantEntity>,
    private readonly journalService: JournalService,
  ) {}

  // --- Recherche de patientes ---

  async rechercherPatientes(terme: string) {
    if (!terme || terme.trim().length < 2) {
      return { patientes: [] };
    }
    const t = terme.trim();
    const patientes = await this.patientesRepo.find({
      where: [
        { nom: Like(`%${t}%`) },
        { postnom: Like(`%${t}%`) },
        { prenom: Like(`%${t}%`) },
        { numeroDossier: Like(`%${t}%`) },
        { telephone: Like(`%${t}%`) },
      ],
      take: 20,
    });
    return {
      patientes: patientes.map((p) => ({
        id: p.id,
        numeroDossier: p.numeroDossier,
        nom: [p.nom, p.postnom, p.prenom].filter(Boolean).join(' '),
        dateNaissance: p.dateNaissance,
        telephone: p.telephone,
      })),
    };
  }

  // --- Liste des dossiers CPS ---

  async listerDossiers(recherche?: string, patienteId?: string) {
    let dossiers: DossierCpsFemmeEntity[];

    // Recherche par patienteId (pour vérifier si un dossier CPS existe déjà)
    if (patienteId) {
      dossiers = await this.dossiersRepo.find({
        where: { patienteId },
        relations: ['patiente', 'visites'],
        order: { creeLe: 'DESC' },
      });
      return { dossiers: dossiers.map((d) => this.formaterResume(d)) };
    }

    if (recherche && recherche.trim()) {
      const terme = recherche.trim();
      const patientes = await this.patientesRepo.find({
        where: [
          { nom: Like(`%${terme}%`) },
          { postnom: Like(`%${terme}%`) },
          { prenom: Like(`%${terme}%`) },
          { numeroDossier: Like(`%${terme}%`) },
          { telephone: Like(`%${terme}%`) },
        ],
      });
      const ids = patientes.map((p) => p.id);
      if (ids.length === 0) return { dossiers: [] };

      dossiers = await this.dossiersRepo
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.patiente', 'p')
        .leftJoinAndSelect('d.visites', 'v')
        .where('d.patiente_id IN (:...ids)', { ids })
        .orderBy('d.cree_le', 'DESC')
        .addOrderBy('v.numero_visite', 'ASC')
        .getMany();
    } else {
      dossiers = await this.dossiersRepo.find({
        relations: ['patiente', 'visites'],
        order: { creeLe: 'DESC' },
      });
    }

    return { dossiers: dossiers.map((d) => this.formaterResume(d)) };
  }

  // --- Detail d un dossier CPS ---

  async obtenirDossier(id: string) {
    const dossier = await this.dossiersRepo.findOne({
      where: { id },
      relations: ['patiente', 'visites'],
    });
    if (!dossier) {
      throw new NotFoundException(`Dossier CPS #${id} introuvable.`);
    }
    dossier.visites?.sort((a, b) => a.numeroVisite - b.numeroVisite);

    // Charger le dossier CPN associé si présent (lecture seule)
    let dossierCpn: any = null;
    if (dossier.dossierCpnId) {
      const cpn = await this.dossiersCpnRepo.findOne({
        where: { id: dossier.dossierCpnId },
        relations: ['patiente'],
      });
      if (cpn) {
        const contacts = await this.contactsCpnRepo.find({
          where: { dossierCpnId: cpn.id },
          order: { numeroContact: 'DESC' },
        });
        const examens = await this.examensCpnRepo.find({
          where: { dossierCpnId: cpn.id },
          order: { creeLe: 'DESC' },
        });
        dossierCpn = {
          id: cpn.id,
          numeroDossierCpn: cpn.numeroDossierCpn,
          statut: cpn.statut,
          dateOuverture: cpn.dateOuverture,
          gestite: cpn.gestite,
          parite: cpn.parite,
          nombreAvortements: cpn.nombreAvortements,
          derniersRegles: cpn.derniersRegles,
          dateProbableAccouchement: cpn.dateProbableAccouchement,
          ageGestionnelOuverture: cpn.ageGestionnelOuverture,
          antecedentsMedicaux: cpn.antecedentsMedicaux,
          antecedentsObstetricaux: cpn.antecedentsObstetricaux,
          groupeSanguin: cpn.groupeSanguin,
          rhesus: cpn.rhesus,
          vihStatut: cpn.vihStatut,
          contacts: contacts.map((c) => ({
            id: c.id,
            numeroContact: c.numeroContact,
            dateContact: c.dateContact,
            ageGestationnel: c.ageGestationnel,
            etatGeneral: c.etatGeneral,
            observations: c.observations,
          })),
          examens: examens.map((e) => ({
            id: e.id,
            libelle: e.libelle,
            typeExamen: e.typeExamen,
            statut: e.statut,
            resultat: e.resultat,
            dateResultat: e.dateResultat,
          })),
        };
      }
    }

    // Charger tous les dossiers CPN de cette patiente (historique grossesses)
    const historiqueCpn = await this.dossiersCpnRepo.find({
      where: { patienteId: dossier.patienteId },
      order: { creeLe: 'DESC' },
    });

    // Charger tous les dossiers CPS de cette patiente (historique postnatal)
    const historiqueCps = await this.dossiersRepo.find({
      where: { patienteId: dossier.patienteId },
      order: { creeLe: 'DESC' },
      relations: ['visites'],
    });

    return {
      dossier: {
        ...this.formaterComplet(dossier),
        dossierCpnAssocie: dossierCpn,
        historiqueCpn: historiqueCpn.map((c) => ({
          id: c.id,
          numeroDossierCpn: c.numeroDossierCpn,
          statut: c.statut,
          dateOuverture: c.dateOuverture,
          gestite: c.gestite,
          parite: c.parite,
        })),
        historiqueCps: historiqueCps.map((c) => ({
          id: c.id,
          numeroDossierCps: c.numeroDossierCps,
          statut: c.statut,
          dateOuverture: c.dateOuverture,
          dateAccouchement: c.dateAccouchement,
          nombreVisites: c.visites?.length ?? 0,
        })),
      },
    };
  }

  // --- Ouverture d un dossier CPS ---

  async ouvrirDossier(dto: CreerDossierCpsDto) {
    const patiente = await this.patientesRepo.findOne({ where: { id: dto.patienteId } });
    if (!patiente) throw new NotFoundException('Patiente introuvable.');

    // Verifier qu il n y a pas deja un dossier CPS OUVERT pour cette patiente
    const existant = await this.dossiersRepo.findOne({
      where: { patienteId: dto.patienteId, statut: 'OUVERT' },
    });
    if (existant) {
      throw new ConflictException({
        message: 'Cette mere a deja un dossier CPS ouvert.',
        code: 'DOSSIER_CPS_EXISTANT',
        dossierId: existant.id,
      });
    }

    const numeroDossierCps = await this.genererNumeroDossier();

    // Si un dossier CPN est lie, le fermer automatiquement
    if (dto.dossierCpnId) {
      const dossierCpn = await this.dossiersCpnRepo.findOne({
        where: { id: dto.dossierCpnId },
      });
      if (dossierCpn && dossierCpn.statut !== 'CLOS') {
        dossierCpn.statut = 'CLOS';
        await this.dossiersCpnRepo.save(dossierCpn);
      }
    }

    const dossier = this.dossiersRepo.create({
      numeroDossierCps,
      patienteId: dto.patienteId,
      accouchementId: dto.accouchementId ?? null,
      dossierCpnId: dto.dossierCpnId ?? null,
      typeAccouchementEntree: dto.typeAccouchementEntree,
      dateOuverture: dto.dateOuverture,
      dateAccouchement: dto.dateAccouchement,
      modeAccouchement: dto.modeAccouchement,
      etatMereEntree: dto.etatMereEntree,
      complicationsAccouchement: dto.complicationsAccouchement ?? null,
      nombreNouveauxNes: dto.nombreNouveauxNes ?? 1,
      etatNouveauNe: dto.etatNouveauNe,
      sexeNouveauNe: dto.sexeNouveauNe ?? null,
      poidsNaissanceG: dto.poidsNaissanceG ?? null,
      scoreApgar1min: dto.scoreApgar1min ?? null,
      scoreApgar5min: dto.scoreApgar5min ?? null,
      gestite: dto.gestite ?? 0,
      parite: dto.parite ?? 0,
      groupeSanguin: dto.groupeSanguin ?? null,
      rhesus: dto.rhesus ?? null,
      vihStatut: dto.vihStatut ?? 'INCONNU',
      notes: dto.notes ?? null,
      statut: 'OUVERT',
    });

    const enregistre = await this.dossiersRepo.save(dossier);
    const complet = await this.dossiersRepo.findOne({
      where: { id: enregistre.id },
      relations: ['patiente'],
    });

    void this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'CREATION',
      module: 'CPS_FEMME',
      section: 'Dossier',
      ressourceId: enregistre.id,
      description: `Ouverture du dossier CPS ${enregistre.numeroDossierCps}`,
    });

    return {
      message: 'Dossier CPS ouvert avec succes.',
      dossier: this.formaterResume({ ...complet!, visites: [] }),
    };
  }

  // --- Modification d un dossier CPS ---

  async modifierDossier(id: string, dto: ModifierDossierCpsDto) {
    const dossier = await this.dossiersRepo.findOne({
      where: { id },
      relations: ['patiente'],
    });
    if (!dossier) throw new NotFoundException(`Dossier CPS #${id} introuvable.`);

    Object.assign(dossier, {
      statut: dto.statut ?? dossier.statut,
      etatMereEntree: dto.etatMereEntree ?? dossier.etatMereEntree,
      complicationsAccouchement:
        typeof dto.complicationsAccouchement !== 'undefined'
          ? dto.complicationsAccouchement
          : dossier.complicationsAccouchement,
      gestite: dto.gestite ?? dossier.gestite,
      parite: dto.parite ?? dossier.parite,
      groupeSanguin:
        typeof dto.groupeSanguin !== 'undefined' ? dto.groupeSanguin : dossier.groupeSanguin,
      rhesus: typeof dto.rhesus !== 'undefined' ? dto.rhesus : dossier.rhesus,
      vihStatut: dto.vihStatut ?? dossier.vihStatut,
      notes: typeof dto.notes !== 'undefined' ? dto.notes : dossier.notes,
    });

    const enregistre = await this.dossiersRepo.save(dossier);

    void this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'MODIFICATION',
      module: 'CPS_FEMME',
      section: 'Dossier',
      ressourceId: enregistre.id,
      description: `Modification du dossier CPS ${enregistre.numeroDossierCps}`,
    });

    return { message: 'Dossier CPS mis a jour.', dossier: this.formaterResume(enregistre) };
  }

  // --- Cloture du dossier CPS ---

  async cloturerDossier(
    id: string,
    dto: {
      closPar: string;
      notesCloture?: string;
      utilisateurId?: string;
      utilisateurNom?: string;
    },
  ) {
    const dossier = await this.dossiersRepo.findOne({ where: { id } });
    if (!dossier) throw new NotFoundException(`Dossier CPS #${id} introuvable.`);
    if (dossier.statut === 'CLOS') {
      throw new BadRequestException('Ce dossier CPS est deja clos.');
    }

    dossier.statut = 'CLOS';
    dossier.dateCloture = new Date().toISOString().split('T')[0];
    dossier.closPar = dto.closPar;
    dossier.notesCloture = dto.notesCloture ?? null;

    await this.dossiersRepo.save(dossier);

    void this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'MODIFICATION',
      module: 'CPS_FEMME',
      section: 'Cloture',
      ressourceId: dossier.id,
      description: `Cloture du dossier CPS ${dossier.numeroDossierCps} par ${dto.closPar}`,
    });

    return { message: 'Dossier CPS cloture avec succes.' };
  }

  // --- Visites CPS ---

  async listerVisites(dossierId: string) {
    const dossier = await this.dossiersRepo.findOne({ where: { id: dossierId } });
    if (!dossier) throw new NotFoundException(`Dossier CPS #${dossierId} introuvable.`);

    const visites = await this.visitesRepo.find({
      where: { dossierCpsId: dossierId },
      order: { numeroVisite: 'ASC' },
    });
    return { visites: visites.map((v) => this.formaterVisite(v)) };
  }

  async ajouterVisite(dossierId: string, dto: CreerVisiteCpsDto) {
    const dossier = await this.dossiersRepo.findOne({ where: { id: dossierId } });
    if (!dossier) throw new NotFoundException(`Dossier CPS #${dossierId} introuvable.`);
    if (dossier.statut === 'CLOS') {
      throw new BadRequestException('Impossible d ajouter une visite : le dossier CPS est clos.');
    }

    // Empecher deux visites du meme type sauf SURPRISE
    if (dto.typeVisite !== 'SURPRISE') {
      const doublon = await this.visitesRepo.findOne({
        where: { dossierCpsId: dossierId, typeVisite: dto.typeVisite },
      });
      if (doublon) {
        throw new ConflictException({
          message: `Une visite ${dto.typeVisite} existe deja pour ce dossier.`,
          code: 'VISITE_DOUBLON_TYPE',
          visiteId: doublon.id,
        });
      }
    }

    const nombreExistantes = await this.visitesRepo.count({
      where: { dossierCpsId: dossierId },
    });

    const visite = this.visitesRepo.create({
      dossierCpsId: dossierId,
      typeVisite: dto.typeVisite,
      numeroVisite: nombreExistantes + 1,
      dateVisite: dto.dateVisite,
      poids: dto.poids ?? null,
      tensionSystolique: dto.tensionSystolique ?? null,
      tensionDiastolique: dto.tensionDiastolique ?? null,
      temperature: dto.temperature ?? null,
      frequenceCardiaque: dto.frequenceCardiaque ?? null,
      etatGeneral: dto.etatGeneral ?? null,
      involutionUterine: dto.involutionUterine ?? null,
      etatSeins: dto.etatSeins ?? null,
      allaitement: dto.allaitement ?? null,
      etatPlaie: dto.etatPlaie ?? null,
      saignements: dto.saignements ?? null,
      lochies: dto.lochies ?? null,
      etatPsychologique: dto.etatPsychologique ?? null,
      oedemes: dto.oedemes ?? null,
      paleur: dto.paleur ?? null,
      perimetreBrachial: dto.perimetreBrachial ?? null,
      contraceptionDiscutee: dto.contraceptionDiscutee ?? false,
      methodeContraceptive: dto.methodeContraceptive ?? null,
      conduiteATenir: dto.conduiteATenir ?? null,
      traitementPrescrit: dto.traitementPrescrit ?? null,
      prochainRdvDate: dto.prochainRdvDate ?? null,
      observations: dto.observations ?? null,
    });

    const enregistree = await this.visitesRepo.save(visite);

    void this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'CREATION',
      module: 'CPS_FEMME',
      section: 'Visite',
      ressourceId: enregistree.id,
      description: `Ajout de la visite ${enregistree.typeVisite} (n°${enregistree.numeroVisite}) pour le dossier ${dossierId}`,
    });

    return {
      message: `Visite ${enregistree.typeVisite} enregistree avec succes.`,
      visite: this.formaterVisite(enregistree),
    };
  }

  async obtenirVisite(dossierId: string, visiteId: string) {
    const visite = await this.visitesRepo.findOne({
      where: { id: visiteId, dossierCpsId: dossierId },
    });
    if (!visite) throw new NotFoundException(`Visite CPS #${visiteId} introuvable.`);
    return { visite: this.formaterVisite(visite) };
  }

  async modifierVisite(dossierId: string, visiteId: string, dto: ModifierVisiteCpsDto) {
    const visite = await this.visitesRepo.findOne({
      where: { id: visiteId, dossierCpsId: dossierId },
    });
    if (!visite) throw new NotFoundException(`Visite CPS #${visiteId} introuvable.`);

    Object.assign(visite, {
      dateVisite: dto.dateVisite ?? visite.dateVisite,
      poids: typeof dto.poids !== 'undefined' ? dto.poids : visite.poids,
      tensionSystolique:
        typeof dto.tensionSystolique !== 'undefined' ? dto.tensionSystolique : visite.tensionSystolique,
      tensionDiastolique:
        typeof dto.tensionDiastolique !== 'undefined' ? dto.tensionDiastolique : visite.tensionDiastolique,
      temperature: typeof dto.temperature !== 'undefined' ? dto.temperature : visite.temperature,
      frequenceCardiaque:
        typeof dto.frequenceCardiaque !== 'undefined' ? dto.frequenceCardiaque : visite.frequenceCardiaque,
      etatGeneral: typeof dto.etatGeneral !== 'undefined' ? dto.etatGeneral : visite.etatGeneral,
      involutionUterine:
        typeof dto.involutionUterine !== 'undefined' ? dto.involutionUterine : visite.involutionUterine,
      etatSeins: typeof dto.etatSeins !== 'undefined' ? dto.etatSeins : visite.etatSeins,
      allaitement: typeof dto.allaitement !== 'undefined' ? dto.allaitement : visite.allaitement,
      etatPlaie: typeof dto.etatPlaie !== 'undefined' ? dto.etatPlaie : visite.etatPlaie,
      saignements: typeof dto.saignements !== 'undefined' ? dto.saignements : visite.saignements,
      lochies: typeof dto.lochies !== 'undefined' ? dto.lochies : visite.lochies,
      etatPsychologique:
        typeof dto.etatPsychologique !== 'undefined' ? dto.etatPsychologique : visite.etatPsychologique,
      oedemes: typeof dto.oedemes !== 'undefined' ? dto.oedemes : visite.oedemes,
      paleur: typeof dto.paleur !== 'undefined' ? dto.paleur : visite.paleur,
      perimetreBrachial:
        typeof dto.perimetreBrachial !== 'undefined' ? dto.perimetreBrachial : visite.perimetreBrachial,
      contraceptionDiscutee:
        typeof dto.contraceptionDiscutee !== 'undefined'
          ? dto.contraceptionDiscutee
          : visite.contraceptionDiscutee,
      methodeContraceptive:
        typeof dto.methodeContraceptive !== 'undefined'
          ? dto.methodeContraceptive
          : visite.methodeContraceptive,
      conduiteATenir:
        typeof dto.conduiteATenir !== 'undefined' ? dto.conduiteATenir : visite.conduiteATenir,
      traitementPrescrit:
        typeof dto.traitementPrescrit !== 'undefined' ? dto.traitementPrescrit : visite.traitementPrescrit,
      prochainRdvDate:
        typeof dto.prochainRdvDate !== 'undefined' ? dto.prochainRdvDate : visite.prochainRdvDate,
      observations: typeof dto.observations !== 'undefined' ? dto.observations : visite.observations,
    });

    const enregistree = await this.visitesRepo.save(visite);

    void this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'MODIFICATION',
      module: 'CPS_FEMME',
      section: 'Visite',
      ressourceId: enregistree.id,
      description: `Modification visite ${enregistree.typeVisite} du dossier ${dossierId}`,
    });

    return { message: 'Visite CPS mise a jour.', visite: this.formaterVisite(enregistree) };
  }

  // --- Generation du numero de dossier CPS ---

  private async genererNumeroDossier(): Promise<string> {
    const annee = new Date().getFullYear();
    const prefixe = `CPS-${annee}-`;
    const dernier = await this.dossiersRepo
      .createQueryBuilder('d')
      .where('d.numero_dossier_cps LIKE :prefixe', { prefixe: `${prefixe}%` })
      .orderBy('d.numero_dossier_cps', 'DESC')
      .getOne();

    let seq = 1;
    if (dernier) {
      const parties = dernier.numeroDossierCps.split('-');
      seq = (parseInt(parties[parties.length - 1], 10) || 0) + 1;
    }
    return `${prefixe}${String(seq).padStart(4, '0')}`;
  }

  // --- Formateurs de reponse ---

  private formaterResume(d: DossierCpsFemmeEntity) {
    const derniereVisite =
      d.visites && d.visites.length > 0 ? d.visites[d.visites.length - 1] : null;
    return {
      id: d.id,
      numeroDossierCps: d.numeroDossierCps,
      statut: d.statut,
      typeAccouchementEntree: d.typeAccouchementEntree,
      dateOuverture: d.dateOuverture,
      dateAccouchement: d.dateAccouchement,
      dateCloture: d.dateCloture,
      patiente: d.patiente
        ? {
            id: d.patiente.id,
            numeroDossier: d.patiente.numeroDossier,
            nom: [d.patiente.nom, d.patiente.postnom, d.patiente.prenom].filter(Boolean).join(' '),
            telephone: d.patiente.telephone,
          }
        : null,
      nombreVisites: d.visites?.length ?? 0,
      derniereVisite: derniereVisite
        ? { typeVisite: derniereVisite.typeVisite, dateVisite: derniereVisite.dateVisite }
        : null,
    };
  }

  private formaterComplet(d: DossierCpsFemmeEntity) {
    return {
      ...this.formaterResume(d),
      accouchementId: d.accouchementId,
      dossierCpnId: d.dossierCpnId,
      modeAccouchement: d.modeAccouchement,
      etatMereEntree: d.etatMereEntree,
      complicationsAccouchement: d.complicationsAccouchement,
      nombreNouveauxNes: d.nombreNouveauxNes,
      etatNouveauNe: d.etatNouveauNe,
      sexeNouveauNe: d.sexeNouveauNe,
      poidsNaissanceG: d.poidsNaissanceG,
      scoreApgar1min: d.scoreApgar1min,
      scoreApgar5min: d.scoreApgar5min,
      gestite: d.gestite,
      parite: d.parite,
      groupeSanguin: d.groupeSanguin,
      rhesus: d.rhesus,
      vihStatut: d.vihStatut,
      closPar: d.closPar,
      notesCloture: d.notesCloture,
      notes: d.notes,
      visites: d.visites?.map((v) => this.formaterVisite(v)) ?? [],
      creeLe: d.creeLe,
    };
  }

  // --- Ajouter un enfant depuis le dossier CPS ---

  async ajouterEnfantDepuisCps(
    dossierId: string,
    dto: {
      nom: string;
      postnom?: string;
      prenom?: string;
      sexe: string;
      dateNaissance: string;
      numeroFiche?: string;
      poids?: number;
    },
  ) {
    const dossier = await this.dossiersRepo.findOne({
      where: { id: dossierId },
      relations: ['patiente'],
    });
    if (!dossier) {
      throw new NotFoundException(`Dossier CPS #${dossierId} introuvable.`);
    }

    const enfant = this.enfantsRepo.create({
      nom: dto.nom,
      postnom: dto.postnom ?? '',
      prenom: dto.prenom ?? '',
      sexe: dto.sexe,
      dateNaissance: dto.dateNaissance,
      // Le lien vers la mère : nom complet depuis la patiente
      nomMere: [dossier.patiente?.nom, dossier.patiente?.postnom, dossier.patiente?.prenom]
        .filter(Boolean)
        .join(' '),
      telephone: dossier.patiente?.telephone ?? '',
      adresse: dossier.patiente?.adresse ?? '',
      // Numero de fiche généré si absent
      numeroFiche:
        dto.numeroFiche ??
        `ENF-${Date.now().toString(36).toUpperCase()}-${dto.nom.substring(0, 3).toUpperCase()}`,
      dateEnregistrement: new Date().toISOString().split('T')[0],
    });

    const enregistre = await this.enfantsRepo.save(enfant);
    return { message: 'Enfant enregistré avec succès.', enfant: enregistre };
  }

  private formaterVisite(v: VisiteCpsFemmeEntity) {
    return {
      id: v.id,
      dossierCpsId: v.dossierCpsId,
      typeVisite: v.typeVisite,
      numeroVisite: v.numeroVisite,
      dateVisite: v.dateVisite,
      poids: v.poids,
      tensionSystolique: v.tensionSystolique,
      tensionDiastolique: v.tensionDiastolique,
      temperature: v.temperature,
      frequenceCardiaque: v.frequenceCardiaque,
      etatGeneral: v.etatGeneral,
      involutionUterine: v.involutionUterine,
      etatSeins: v.etatSeins,
      allaitement: v.allaitement,
      etatPlaie: v.etatPlaie,
      saignements: v.saignements,
      lochies: v.lochies,
      etatPsychologique: v.etatPsychologique,
      oedemes: v.oedemes,
      paleur: v.paleur,
      perimetreBrachial: v.perimetreBrachial,
      contraceptionDiscutee: v.contraceptionDiscutee,
      methodeContraceptive: v.methodeContraceptive,
      conduiteATenir: v.conduiteATenir,
      traitementPrescrit: v.traitementPrescrit,
      prochainRdvDate: v.prochainRdvDate,
      observations: v.observations,
      creeLe: v.creeLe,
    };
  }

  // --- Examens CPS (depuis le dossier CPN associé) ---

  async listerExamensCps(dossierId: string) {
    const dossier = await this.dossiersRepo.findOne({
      where: { id: dossierId },
      relations: ['visites'],
    });
    if (!dossier) throw new NotFoundException(`Dossier CPS #${dossierId} introuvable.`);
    const visites = (dossier.visites ?? []).sort((a, b) => a.numeroVisite - b.numeroVisite);
    return {
      examens: visites.map((v) => ({
        id: v.id,
        typeVisite: v.typeVisite,
        numeroVisite: v.numeroVisite,
        dateVisite: v.dateVisite,
        etatGeneral: v.etatGeneral,
        involutionUterine: v.involutionUterine,
        etatSeins: v.etatSeins,
        allaitement: v.allaitement,
        etatPlaie: v.etatPlaie,
        saignements: v.saignements,
        lochies: v.lochies,
        etatPsychologique: v.etatPsychologique,
        oedemes: v.oedemes,
        paleur: v.paleur,
        poids: v.poids,
        temperature: v.temperature,
        tensionSystolique: v.tensionSystolique,
        tensionDiastolique: v.tensionDiastolique,
      })),
    };
  }

  // --- Analyse IA d'une visite postnatale CPS ---

  async analyserVisite(dossierId: string, dto: AnalyserVisiteCpsDto) {
    const dossier = await this.dossiersRepo.findOne({
      where: { id: dossierId },
      relations: ['patiente', 'visites'],
    });
    if (!dossier) throw new NotFoundException(`Dossier CPS #${dossierId} introuvable.`);

    const visites = (dossier.visites ?? []).sort((a, b) => a.numeroVisite - b.numeroVisite);
    const patiente = dossier.patiente;

    // Charger le dossier CPN associé pour contexte obstétrical
    let contexteCpn = '';
    if (dossier.dossierCpnId) {
      const cpn = await this.dossiersCpnRepo.findOne({ where: { id: dossier.dossierCpnId } });
      const contacts = cpn ? await this.contactsCpnRepo.find({
        where: { dossierCpnId: cpn.id },
        order: { numeroContact: 'DESC' },
        take: 3,
      }) : [];
      if (cpn) {
        contexteCpn = [
          `--- Suivi CPN associé (${cpn.numeroDossierCpn}) ---`,
          cpn.gestite != null ? `Gestité : ${cpn.gestite}` : '',
          cpn.parite != null ? `Parité : ${cpn.parite}` : '',
          cpn.nombreAvortements ? `Avortements : ${cpn.nombreAvortements}` : '',
          cpn.groupeSanguin ? `Groupe sanguin : ${cpn.groupeSanguin} ${cpn.rhesus ?? ''}` : '',
          cpn.vihStatut ? `VIH : ${cpn.vihStatut}` : '',
          cpn.antecedentsMedicaux ? `Antécédents médicaux : ${cpn.antecedentsMedicaux}` : '',
          contacts.length > 0 ? `Dernier contact CPN : ${contacts[0].dateContact}, poids=${contacts[0].poids ?? '?'} kg, tension=${contacts[0].tensionSystolique ?? '?'}/${contacts[0].tensionDiastolique ?? '?'}` : '',
        ].filter(Boolean).join('\n');
      }
    }

    // Historique visites CPS
    const historiqueVisites = visites.length === 0
      ? 'Aucune visite antérieure.'
      : visites.map((v) =>
          `Visite ${v.typeVisite} (${v.dateVisite}) : poids=${v.poids ?? '?'} kg, tension=${v.tensionSystolique ?? '?'}/${v.tensionDiastolique ?? '?'}, involution=${v.involutionUterine ?? '?'}, seins=${v.etatSeins ?? '?'}, allaitement=${v.allaitement ?? '?'}`,
        ).join('\n');

    // Valeurs actuelles
    const typeLibelles: Record<string, string> = { SIX_HEURES: '6 heures post-partum', SIX_JOURS: '6 jours post-partum', SIX_SEMAINES: '6 semaines post-partum', SURPRISE: 'visite surprise' };
    const valeursActuelles = [
      dto.typeVisite ? `Type de visite : ${typeLibelles[dto.typeVisite] ?? dto.typeVisite}` : '',
      dto.etatGeneral ? `État général : ${dto.etatGeneral}` : '',
      dto.poids != null ? `Poids maternel : ${dto.poids} kg` : '',
      dto.tensionSystolique != null ? `Tension : ${dto.tensionSystolique}/${dto.tensionDiastolique} mmHg` : '',
      dto.temperature != null ? `Température : ${dto.temperature} °C` : '',
      dto.frequenceCardiaque != null ? `Fréquence cardiaque : ${dto.frequenceCardiaque} bpm` : '',,
      dto.perimetreBrachial != null ? `Périmètre brachial : ${dto.perimetreBrachial} cm` : '',
      dto.involutionUterine ? `Involution utérine : ${dto.involutionUterine}` : '',
      dto.etatSeins ? `État des seins : ${dto.etatSeins}` : '',
      dto.allaitement ? `Allaitement : ${dto.allaitement}` : '',
      dto.etatPlaie ? `État de la plaie : ${dto.etatPlaie}` : '',
      dto.saignements ? `Saignements : ${dto.saignements}` : '',
      dto.lochies ? `Lochies : ${dto.lochies}` : '',
      dto.etatPsychologique ? `État psychologique : ${dto.etatPsychologique}` : '',
      dto.oedemes ? 'Œdèmes : oui' : '',
      dto.paleur ? 'Pâleur : oui' : '',
    ].filter(Boolean).join('\n');

    const nomPatiente = patiente ? [patiente.nom, patiente.postnom, patiente.prenom].filter(Boolean).join(' ') : 'Patiente';

    const prompt = `Tu es un assistant clinique dans une maternité à Goma, RDC.
Tu aides l'infirmière lors de la consultation postnatale (CPS) à identifier les signes de danger.

Règles :
- Utilise du français simple. Pas de jargon médical complexe.
- Ne jamais dire "référer" : la patiente EST déjà à la maternité.
- Focus sur la période post-partum : risque hémorragique, infection, dépression post-partum, allaitement.

Patiente : ${nomPatiente}
Mode d'accouchement : ${dossier.modeAccouchement}
Date d'accouchement : ${dossier.dateAccouchement}
${contexteCpn ? contexteCpn + '\n' : ''}
Historique visites CPS :
${historiqueVisites}

Valeurs de la visite actuelle :
${valeursActuelles}

Retourne un JSON VALIDE avec cette structure :
{
  "niveau": "CRITIQUE" | "URGENT" | "ATTENTION" | "NORMAL",
  "conclusion": "message court pour l'infirmière (1-2 phrases)",
  "suggestionTraitement": "conduite à tenir prête à copier (2-5 lignes)",
  "pointsAnalyse": [
    {
      "code": "identifiant_court",
      "label": "Nom du point",
      "valeurActuelle": "valeur mesurée",
      "interpretation": "explication simple (1-2 phrases)",
      "statut": "OK" | "ATTENTION" | "URGENT" | "CRITIQUE"
    }
  ]
}

Réponds UNIQUEMENT avec le JSON.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Tu es un assistant clinique CPS postnatal. Tu réponds uniquement en JSON valide.' },
        { role: 'user', content: prompt },
      ],
    });

    const contenu = completion.choices[0]?.message?.content ?? '{}';
    const resultatIA = JSON.parse(contenu) as {
      niveau: string;
      conclusion: string;
      suggestionTraitement: string;
      pointsAnalyse: { code: string; label: string; valeurActuelle: string; interpretation: string; statut: string }[];
    };

    // Tableau comparatif visites
    const tableau = [
      ...visites.map((v) => ({
        visite: `${typeLibelles[v.typeVisite] ?? v.typeVisite}`,
        date: v.dateVisite,
        poids: v.poids != null ? `${v.poids} kg` : '—',
        tension: v.tensionSystolique != null ? `${v.tensionSystolique}/${v.tensionDiastolique}` : '—',
        temperature: v.temperature != null ? `${v.temperature} °C` : '—',
        involution: v.involutionUterine ?? '—',
        estActuel: false,
      })),
      {
        visite: dto.typeVisite ? (typeLibelles[dto.typeVisite] ?? dto.typeVisite) : 'Actuelle',
        date: new Date().toISOString().slice(0, 10),
        poids: dto.poids != null ? `${dto.poids} kg` : '—',
        tension: dto.tensionSystolique != null ? `${dto.tensionSystolique}/${dto.tensionDiastolique}` : '—',
        temperature: dto.temperature != null ? `${dto.temperature} °C` : '—',
        involution: dto.involutionUterine ?? '—',
        estActuel: true,
      },
    ];

    return {
      niveau: resultatIA.niveau ?? 'NORMAL',
      conclusion: resultatIA.conclusion ?? '',
      suggestionTraitement: resultatIA.suggestionTraitement ?? '',
      pointsAnalyse: resultatIA.pointsAnalyse ?? [],
      tableau,
    };
  }
}
