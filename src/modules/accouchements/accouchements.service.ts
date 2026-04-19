import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { AccouchementEntity } from './entities/accouchement.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { CreerAccouchementDto } from './dto/creer-accouchement.dto';

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
    return { accouchement: this.formaterDetail(acc) };
  }

  // --- Enregistrement d un accouchement ---

  async enregistrerAccouchement(dto: CreerAccouchementDto) {
    const patiente = await this.patientesRepo.findOne({ where: { id: dto.patienteId } });
    if (!patiente) throw new NotFoundException('Patiente introuvable.');

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

    // Contrainte 2 : un accouchement EN_COURS ne peut pas coexister avec un autre pour la même patiente
    const enCours = await this.accouchementsRepo.findOne({
      where: { patienteId: dto.patienteId, statut: 'EN_COURS' },
    });
    if (enCours) {
      throw new ConflictException(
        `Cette patiente a déjà un accouchement en cours (${enCours.numeroAccouchement}). Clôturez-le avant d'en créer un nouveau.`,
      );
    }

    // Contrainte 3 : délai minimal de 6 mois entre deux accouchements
    const dateNouvel = new Date(dto.dateAccouchement);
    const sixMoisAvant = new Date(dateNouvel);
    sixMoisAvant.setMonth(sixMoisAvant.getMonth() - 6);

    const accRecent = await this.accouchementsRepo
      .createQueryBuilder('a')
      .where('a.patiente_id = :pid', { pid: dto.patienteId })
      .andWhere('a.date_accouchement >= :limite', { limite: sixMoisAvant.toISOString().slice(0, 10) })
      .andWhere('a.date_accouchement <= :date', { date: dateNouvel.toISOString().slice(0, 10) })
      .orderBy('a.date_accouchement', 'DESC')
      .getOne();

    if (accRecent) {
      const dateRecente = new Date(accRecent.dateAccouchement).toLocaleDateString('fr-FR');
      throw new BadRequestException(
        `Un accouchement a déjà été enregistré le ${dateRecente} pour cette patiente (${accRecent.numeroAccouchement}). Un délai minimum de 6 mois est requis entre deux accouchements.`,
      );
    }

    const numeroAccouchement = await this.genererNumero();

    const acc = this.accouchementsRepo.create({
      numeroAccouchement,
      patienteId: dto.patienteId,
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
    });

    const sauvegarde = await this.accouchementsRepo.save(acc);

    // Clôture automatique du dossier CPN lié (explicite ou dernier ouvert de la patiente)
    const dossierCpnAFermer = dto.dossierCpnId
      ? await this.dossiersCpnRepo.findOne({ where: { id: dto.dossierCpnId } })
      : await this.dossiersCpnRepo.findOne({ where: { patienteId: dto.patienteId, statut: 'OUVERT' }, order: { creeLe: 'DESC' } });

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
    return { accouchement: this.formaterDetail(complet!) };
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
    };
  }
}
