import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { AccouchementEntity } from './entities/accouchement.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';
import { CreerAccouchementDto } from './dto/creer-accouchement.dto';

// Ce service centralise toute la logique metier du module accouchements.
@Injectable()
export class AccouchementsService {
  constructor(
    @InjectRepository(AccouchementEntity)
    private readonly accouchementsRepo: Repository<AccouchementEntity>,
    @InjectRepository(PatienteEntity)
    private readonly patientesRepo: Repository<PatienteEntity>,
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
