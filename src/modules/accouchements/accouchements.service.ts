import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { AccouchementEntity } from './entities/accouchement.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { DossierCpsFemmeEntity } from '../cps-femme/entities/dossier-cps-femme.entity';
import { DossierCpsEnfantEntity } from '../cps-enfant/entities/dossier-cps-enfant.entity';
import { CreerAccouchementDto } from './dto/creer-accouchement.dto';
import { ModifierAccouchementDto } from './dto/modifier-accouchement.dto';
import { JournalService } from '../journal/journal.service';

// Ce service centralise toute la logique metier du module accouchements.
@Injectable()
export class AccouchementsService {
  constructor(
    @InjectRepository(AccouchementEntity)
    private readonly accouchementsRepo: Repository<AccouchementEntity>,
    @InjectRepository(PatienteEntity)
    private readonly patientesRepo: Repository<PatienteEntity>,
    @InjectRepository(DossierCpnEntity)
    private readonly dossiersCpnRepo: Repository<DossierCpnEntity>,
    @InjectRepository(DossierCpsFemmeEntity)
    private readonly dossiersCpsFemmeRepo: Repository<DossierCpsFemmeEntity>,
    @InjectRepository(DossierCpsEnfantEntity)
    private readonly dossiersCpsEnfantRepo: Repository<DossierCpsEnfantEntity>,
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

  // --- Liste des accouchements ---

  async listerAccouchements(recherche?: string) {
    let accouchements: AccouchementEntity[];

    if (recherche && recherche.trim()) {
      const terme = recherche.trim();
      const patientes = await this.patientesRepo.find({
        where: [
          { nom: Like(`%${terme}%`) },
          { postnom: Like(`%${terme}%`) },
          { prenom: Like(`%${terme}%`) },
          { numeroDossier: Like(`%${terme}%`) },
        ],
      });
      const ids = patientes.map((p) => p.id);
      if (ids.length === 0) return { accouchements: [] };

      accouchements = await this.accouchementsRepo
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.patiente', 'p')
        .where('a.patiente_id IN (:...ids)', { ids })
        .orderBy('a.date_accouchement', 'DESC')
        .getMany();
    } else {
      accouchements = await this.accouchementsRepo.find({
        relations: ['patiente'],
        order: { dateAccouchement: 'DESC' },
      });
    }

    return { accouchements: accouchements.map((a) => this.formaterResume(a)) };
  }

  // --- Detail d un accouchement ---

  async obtenirAccouchement(id: string) {
    const acc = await this.accouchementsRepo.findOne({
      where: { id },
      relations: ['patiente'],
    });
    if (!acc) throw new NotFoundException(`Accouchement #${id} introuvable.`);
    let numeroDossierCpn: string | null = null;
    if (acc.dossierCpnId) {
      const cpn = await this.dossiersCpnRepo.findOne({ where: { id: acc.dossierCpnId }, select: ['id', 'numeroDossierCpn'] });
      numeroDossierCpn = cpn?.numeroDossierCpn ?? null;
    }
    return { accouchement: { ...this.formaterDetail(acc), numeroDossierCpn } };
  }

  // --- Enregistrement d un accouchement ---

  async enregistrerAccouchement(dto: CreerAccouchementDto) {
    // Resoudre la patiente : priorite au numeroDossierMere (AFIA-...), sinon patienteId UUID
    let patiente: PatienteEntity | null = null;
    if (dto.numeroDossierMere) {
      patiente = await this.patientesRepo.findOne({ where: { numeroDossier: dto.numeroDossierMere } });
      if (!patiente) throw new NotFoundException(`Aucune patiente trouvée avec le dossier "${dto.numeroDossierMere}".`);
    } else if (dto.patienteId) {
      patiente = await this.patientesRepo.findOne({ where: { id: dto.patienteId } });
      if (!patiente) throw new NotFoundException('Patiente introuvable.');
    } else {
      throw new NotFoundException('Veuillez fournir numeroDossierMere ou patienteId.');
    }

    // Contrainte 1 : un dossier CPN ne peut être lié qu à un seul accouchement
    if (dto.dossierCpnId) {
      const dejaLie = await this.accouchementsRepo.findOne({
        where: { dossierCpnId: dto.dossierCpnId },
      });
      if (dejaLie) {
        throw new ConflictException(
          `Le dossier CPN est déjà lié à l'accouchement ${dejaLie.numeroAccouchement}. Un dossier CPN ne peut avoir qu'un seul accouchement.`,
        );
      }
    }

    // Contrainte délai minimal de 6 mois entre deux accouchements pour la même mère.
    // On vérifie sur une fenêtre de ±6 mois autour de la nouvelle date.
    const dateNouvel = new Date(dto.dateAccouchement);
    const sixMoisAvant = new Date(dateNouvel);
    sixMoisAvant.setMonth(sixMoisAvant.getMonth() - 6);
    const sixMoisApres = new Date(dateNouvel);
    sixMoisApres.setMonth(sixMoisApres.getMonth() + 6);

    const accRecent = await this.accouchementsRepo
      .createQueryBuilder('a')
      .where('a.patiente_id = :pid', { pid: patiente.id })
      .andWhere('a.date_accouchement > :avant', { avant: sixMoisAvant.toISOString().slice(0, 10) })
      .andWhere('a.date_accouchement < :apres', { apres: sixMoisApres.toISOString().slice(0, 10) })
      .orderBy('a.date_accouchement', 'DESC')
      .getOne();

    if (accRecent) {
      const dateRecente = new Date(accRecent.dateAccouchement).toLocaleDateString('fr-FR');
      throw new BadRequestException(
        `Un accouchement a déjà été enregistré le ${dateRecente} pour la mère (dossier ${patiente.numeroDossier}, ${accRecent.numeroAccouchement}). Un délai minimum de 6 mois est requis entre deux accouchements.`,
      );
    }

    const numeroAccouchement = await this.genererNumero();

    const acc = this.accouchementsRepo.create({
      numeroAccouchement,
      patienteId: patiente.id,
      dossierCpnId: dto.dossierCpnId ?? null,
      typeAccouchement: dto.typeAccouchement,
      dateAccouchement: dto.dateAccouchement,
      ageGestationnel: dto.ageGestationnel ?? null,
      modeAccouchement: dto.modeAccouchement,
      etatMere: dto.etatMere,
      complicationsMere: dto.complicationsMere ?? null,
      perteSanguineMl: dto.perteSanguineMl ?? null,
      nombreNouveauxNes: dto.nombreNouveauxNes ?? 1,
      etatNouveauNe: dto.etatNouveauNe,
      sexeNouveauNe: dto.sexeNouveauNe ?? null,
      poidsNaissanceG: dto.poidsNaissanceG ?? null,
      scoreApgar1min: dto.scoreApgar1min ?? null,
      scoreApgar5min: dto.scoreApgar5min ?? null,
      anomaliesCongenitales: dto.anomaliesCongenitales ?? null,
      notes: dto.notes ?? null,
      statut: 'EN_COURS',
      enregistrePar: dto.utilisateurNom ?? null,
    });

    const sauvegarde = await this.accouchementsRepo.save(acc);

    // Clôture automatique du dossier CPN lié (explicite ou dernier ouvert de la patiente)
    const dossierCpnAFermer = dto.dossierCpnId
      ? await this.dossiersCpnRepo.findOne({ where: { id: dto.dossierCpnId } })
      : await this.dossiersCpnRepo.findOne({ where: { patienteId: patiente.id, statut: 'OUVERT' }, order: { creeLe: 'DESC' } });

    if (dossierCpnAFermer && dossierCpnAFermer.statut === 'OUVERT') {
      dossierCpnAFermer.statut = 'CLOS';
      dossierCpnAFermer.dateCloture = new Date().toISOString().slice(0, 10);
      dossierCpnAFermer.notesCloture = `Clôturé automatiquement suite à l'enregistrement de l'accouchement ${sauvegarde.numeroAccouchement}.`;
      await this.dossiersCpnRepo.save(dossierCpnAFermer);
      // Mettre à jour le lien si non fourni explicitement
      if (!dto.dossierCpnId) {
        await this.accouchementsRepo.update(sauvegarde.id, { dossierCpnId: dossierCpnAFermer.id });
      }
    }

    const complet = await this.accouchementsRepo.findOne({
      where: { id: sauvegarde.id },
      relations: ['patiente'],
    });

    const nomPatiente = complet?.patiente
      ? [complet.patiente.nom, complet.patiente.postnom, complet.patiente.prenom].filter(Boolean).join(' ')
      : '';
    this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'CREATION',
      module: 'ACCOUCHEMENTS',
      section: 'accouchement',
      ressourceId: sauvegarde.id,
      description: `Enregistrement de l'accouchement ${sauvegarde.numeroAccouchement} pour ${nomPatiente}.`,
      meta: { typeAccouchement: dto.typeAccouchement, modeAccouchement: dto.modeAccouchement, etatMere: dto.etatMere, etatNouveauNe: dto.etatNouveauNe },
    });

    return { accouchement: this.formaterDetail(complet!) };
  }

  // --- Modification d un accouchement ---

  async modifierAccouchement(id: string, dto: ModifierAccouchementDto) {
    const acc = await this.accouchementsRepo.findOne({ where: { id }, relations: ['patiente'] });
    if (!acc) throw new NotFoundException(`Accouchement #${id} introuvable.`);

    if (dto.typeAccouchement !== undefined) acc.typeAccouchement = dto.typeAccouchement;
    if (dto.dateAccouchement !== undefined) acc.dateAccouchement = dto.dateAccouchement;
    if (dto.ageGestationnel !== undefined) acc.ageGestationnel = dto.ageGestationnel ?? null;
    if (dto.modeAccouchement !== undefined) acc.modeAccouchement = dto.modeAccouchement;
    if (dto.etatMere !== undefined) acc.etatMere = dto.etatMere;
    if (dto.complicationsMere !== undefined) acc.complicationsMere = dto.complicationsMere ?? null;
    if (dto.perteSanguineMl !== undefined) acc.perteSanguineMl = dto.perteSanguineMl ?? null;
    if (dto.nombreNouveauxNes !== undefined) acc.nombreNouveauxNes = dto.nombreNouveauxNes ?? 1;
    if (dto.etatNouveauNe !== undefined) acc.etatNouveauNe = dto.etatNouveauNe;
    if (dto.sexeNouveauNe !== undefined) acc.sexeNouveauNe = dto.sexeNouveauNe ?? null;
    if (dto.poidsNaissanceG !== undefined) acc.poidsNaissanceG = dto.poidsNaissanceG ?? null;
    if (dto.scoreApgar1min !== undefined) acc.scoreApgar1min = dto.scoreApgar1min ?? null;
    if (dto.scoreApgar5min !== undefined) acc.scoreApgar5min = dto.scoreApgar5min ?? null;
    if (dto.anomaliesCongenitales !== undefined) acc.anomaliesCongenitales = dto.anomaliesCongenitales ?? null;
    if (dto.notes !== undefined) acc.notes = dto.notes ?? null;
    if (dto.utilisateurNom) acc.modifiePar = dto.utilisateurNom;

    const sauvegarde = await this.accouchementsRepo.save(acc);

    const nomPatiente = acc.patiente
      ? [acc.patiente.nom, acc.patiente.postnom, acc.patiente.prenom].filter(Boolean).join(' ')
      : '';
    this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'MODIFICATION',
      module: 'ACCOUCHEMENTS',
      section: 'accouchement',
      ressourceId: sauvegarde.id,
      description: `Modification de l'accouchement ${sauvegarde.numeroAccouchement} pour ${nomPatiente}.`,
    });

    let numeroDossierCpn: string | null = null;
    if (sauvegarde.dossierCpnId) {
      const cpn = await this.dossiersCpnRepo.findOne({ where: { id: sauvegarde.dossierCpnId }, select: ['id', 'numeroDossierCpn'] });
      numeroDossierCpn = cpn?.numeroDossierCpn ?? null;
    }

    const complet = await this.accouchementsRepo.findOne({ where: { id }, relations: ['patiente'] });
    return { accouchement: { ...this.formaterDetail(complet!), numeroDossierCpn } };
  }

  // --- Statut CPS lié à un accouchement ---

  // Retourne si la CPS Femme est déjà ouverte pour cet accouchement,
  // et combien de CPS Enfant ont été ouverts vs le nombre de nouveau-nés attendus.
  async obtenirStatutCps(accouchementId: string) {
    const acc = await this.accouchementsRepo.findOne({
      where: { id: accouchementId },
      relations: ['patiente'],
    });
    if (!acc) throw new NotFoundException(`Accouchement #${accouchementId} introuvable.`);

    // CPS Femme : vérifier si un dossier est lié à cet accouchement
    const cpsFemme = await this.dossiersCpsFemmeRepo.findOne({
      where: { accouchementId },
      select: ['id', 'numeroDossierCps', 'statut'],
    });

    // CPS Enfant : comptage des dossiers ouverts pour la mère de cet accouchement
    // Le lien se fait via mereId (patienteId de l'accouchement)
    const nombreCpsEnfant = await this.dossiersCpsEnfantRepo
      .createQueryBuilder('ce')
      .where('ce.mere_id = :mereId', { mereId: acc.patienteId })
      .andWhere("ce.statut != 'CLOS'")
      .getCount();

    return {
      cpsFemmeOuvert: !!cpsFemme,
      cpsFemmeId: cpsFemme?.id ?? null,
      cpsFemmeNumero: cpsFemme?.numeroDossierCps ?? null,
      nombreNouveauxNes: acc.nombreNouveauxNes ?? 1,
      nombreCpsEnfantOuverts: nombreCpsEnfant,
      cpsEnfantComplet: nombreCpsEnfant >= (acc.nombreNouveauxNes ?? 1),
    };
  }

  // --- Generation du numero d accouchement ---

  private async genererNumero(): Promise<string> {
    const annee = new Date().getFullYear();
    const prefixe = `ACC-${annee}-`;
    const dernier = await this.accouchementsRepo
      .createQueryBuilder('a')
      .where('a.numero_accouchement LIKE :prefixe', { prefixe: `${prefixe}%` })
      .orderBy('a.numero_accouchement', 'DESC')
      .getOne();

    let seq = 1;
    if (dernier) {
      const parties = dernier.numeroAccouchement.split('-');
      seq = (parseInt(parties[parties.length - 1], 10) || 0) + 1;
    }
    return `${prefixe}${String(seq).padStart(4, '0')}`;
  }

  // --- Formateurs de reponse ---

  private formaterResume(a: AccouchementEntity) {
    return {
      id: a.id,
      numeroAccouchement: a.numeroAccouchement,
      patiente: a.patiente
        ? {
            id: a.patiente.id,
            numeroDossier: a.patiente.numeroDossier,
            nom: [a.patiente.nom, a.patiente.postnom, a.patiente.prenom].filter(Boolean).join(' '),
          }
        : null,
      typeAccouchement: a.typeAccouchement,
      dateAccouchement: a.dateAccouchement,
      modeAccouchement: a.modeAccouchement,
      etatMere: a.etatMere,
      etatNouveauNe: a.etatNouveauNe,
      statut: a.statut,
      creeLe: a.creeLe,
    };
  }

  private formaterDetail(a: AccouchementEntity) {
    return {
      ...this.formaterResume(a),
      dossierCpnId: a.dossierCpnId,
      ageGestationnel: a.ageGestationnel,
      complicationsMere: a.complicationsMere,
      perteSanguineMl: a.perteSanguineMl,
      nombreNouveauxNes: a.nombreNouveauxNes,
      sexeNouveauNe: a.sexeNouveauNe,
      poidsNaissanceG: a.poidsNaissanceG,
      scoreApgar1min: a.scoreApgar1min,
      scoreApgar5min: a.scoreApgar5min,
      anomaliesCongenitales: a.anomaliesCongenitales,
      notes: a.notes,
      cpsFemmeId: a.cpsFemmeId,
      dossierEnfantId: a.dossierEnfantId,
      modifieLe: a.modifieLe,
      enregistrePar: a.enregistrePar,
      modifiePar: a.modifiePar,
    };
  }
}
