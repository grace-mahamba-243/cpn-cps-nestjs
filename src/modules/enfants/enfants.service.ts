import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { EnfantEntity } from './entities/enfant.entity';
import { CreerEnfantDto } from './dto/creer-enfant.dto';
import { ExamenEnfantEntity } from './entities/examen-enfant.entity';
import { CreerExamenEnfantDto } from './dto/creer-examen-enfant.dto';
import { ModifierExamenEnfantDto } from './dto/modifier-examen-enfant.dto';
import { JournalService } from '../journal/journal.service';

// Ce service centralise la logique metier du module dossiers enfants.
@Injectable()
export class EnfantsService {
  constructor(
    @InjectRepository(EnfantEntity)
    private readonly enfantsRepository: Repository<EnfantEntity>,
    @InjectRepository(ExamenEnfantEntity)
    private readonly examensRepository: Repository<ExamenEnfantEntity>,
    private readonly journalService: JournalService,
  ) {}

  // Retourne la liste des enfants avec recherche optionnelle.
  async findAll(recherche?: string): Promise<EnfantEntity[]> {
    if (recherche && recherche.trim()) {
      const terme = `%${recherche.trim()}%`;
      return this.enfantsRepository.find({
        where: [
          { nom: Like(terme) },
          { postnom: Like(terme) },
          { prenom: Like(terme) },
          { nomMere: Like(terme) },
          { telephone: Like(terme) },
          { numeroDossier: Like(terme) },
        ],
        order: { nom: 'ASC' },
      });
    }
    return this.enfantsRepository.find({ order: { nom: 'ASC' } });
  }

  // Retourne un enfant par son identifiant ou leve une exception 404.
  async findOne(id: string): Promise<EnfantEntity> {
    const enfant = await this.enfantsRepository.findOne({ where: { id } });
    if (!enfant) throw new NotFoundException(`Dossier enfant #${id} introuvable.`);
    return enfant;
  }

  // Retourne le dossier enfant lié à un accouchement + index de nouveau-né.
  async findByAccouchementAndIndex(accouchementId: string, indexNouveauNe: number) {
    if (!accouchementId || Number.isNaN(indexNouveauNe) || indexNouveauNe < 0) {
      return null;
    }
    return this.enfantsRepository.findOne({
      where: { accouchementId, indexNouveauNe },
    });
  }

  // Retourne le resume complet d un dossier enfant avec ses sous-modules.
  async findResume(id: string): Promise<EnfantEntity> {
    const enfant = await this.enfantsRepository.findOne({
      where: { id },
      relations: ['patiente', 'suivis', 'doses'],
    });
    if (!enfant) throw new NotFoundException(`Dossier enfant #${id} introuvable.`);
    return enfant;
  }

  // Cree un nouveau dossier enfant.
  async creer(dto: CreerEnfantDto): Promise<EnfantEntity> {
    const ficheExistante = await this.enfantsRepository.findOne({
      where: { numeroDossier: dto.numeroDossier },
    });
    if (ficheExistante) {
      throw new ConflictException(
        `Le numero de dossier "${dto.numeroDossier}" est deja utilise.`,
      );
    }

    if (dto.accouchementId && typeof dto.indexNouveauNe === 'number') {
      const dejaLie = await this.enfantsRepository.findOne({
        where: { accouchementId: dto.accouchementId, indexNouveauNe: dto.indexNouveauNe },
      });
      if (dejaLie) {
        throw new ConflictException(
          `Un dossier enfant existe deja pour ce nouveau-ne (#${dejaLie.numeroDossier}).`,
        );
      }
    }

    const doublon = await this.enfantsRepository.findOne({
      where: {
        nom: dto.nom.trim(),
        postnom: dto.postnom.trim(),
        dateNaissance: dto.dateNaissance,
        nomMere: dto.nomMere?.trim() ?? '',
      },
    });
    if (doublon) {
      throw new ConflictException(
        `Un dossier enfant pour "${dto.nom} ${dto.postnom}" (ne le ${dto.dateNaissance}, mere: ${dto.nomMere}) existe deja (#${doublon.numeroDossier}).`,
      );
    }

    const entite = this.enfantsRepository.create({
      numeroDossier: dto.numeroDossier,
      nom: dto.nom.trim(),
      postnom: dto.postnom.trim(),
      prenom: dto.prenom?.trim() ?? null,
      sexe: dto.sexe,
      dateNaissance: dto.dateNaissance,
      patienteId: dto.patienteId ?? (dto as any).mereId ?? null,
      accouchementId: dto.accouchementId ?? null,
      indexNouveauNe: typeof dto.indexNouveauNe === 'number' ? dto.indexNouveauNe : null,
      lieuNaissance: dto.lieuNaissance ?? 'INTERNE',
      poidsNaissanceG: dto.poidsNaissanceG ?? null,
      scoreApgar1min: dto.scoreApgar1min ?? null,
      scoreApgar5min: dto.scoreApgar5min ?? null,
      etatNaissance: dto.etatNaissance ?? 'VIVANT',
      ageGestationnelSemaines: dto.ageGestationnelSemaines ?? null,
      nomMere: dto.nomMere?.trim() ?? '',
      nomPere: dto.nomPere?.trim() ?? null,
      telephone: dto.telephone ?? '',
      adresse: dto.adresse ?? '',
      dateEnregistrement: dto.dateEnregistrement,
      enregistrePar: dto.utilisateurNom ?? null,
    });
    const enregistre = await this.enfantsRepository.save(entite);

    this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'CREATION',
      module: 'ENFANTS',
      section: 'dossier',
      ressourceId: enregistre.id,
      description: `Cr\u00e9ation du dossier enfant ${dto.numeroDossier} pour ${dto.nom} ${dto.postnom}.`,
    });

    return enregistre;
  }

  // --- Examens ---

  // Retourne tous les examens d'un enfant, tries par date de creation decroissante.
  async listerExamens(enfantId: string) {
    const enfant = await this.enfantsRepository.findOne({ where: { id: enfantId } });
    if (!enfant) throw new NotFoundException(`Dossier enfant #${enfantId} introuvable.`);

    const examens = await this.examensRepository.find({
      where: { enfantId },
      order: { creeLe: 'DESC' },
    });
    return { examens: examens.map((e) => this.formaterExamen(e)) };
  }

  // Demande un nouvel examen pour un enfant. Les examens biologiques sont automatiquement
  // visibles au laboratoire(pris en charge depuis le module labo).
  async demanderExamen(enfantId: string, dto: CreerExamenEnfantDto) {
    const enfant = await this.enfantsRepository.findOne({ where: { id: enfantId } });
    if (!enfant) throw new NotFoundException(`Dossier enfant #${enfantId} introuvable.`);

    const examen = this.examensRepository.create({
      enfantId,
      suiviEnfantId: dto.suiviEnfantId ?? null,
      typeExamen: dto.typeExamen,
      libelle: dto.libelle.trim(),
      statut: 'DEMANDE',
      source: dto.source ?? 'INTERNE',
      dateExamen: dto.dateExamen ?? null,
      notes: dto.notes ?? null,
      enregistrePar: dto.utilisateurNom ?? null,
    });

    const enregistre = await this.examensRepository.save(examen);

    this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'CREATION',
      module: 'ENFANTS',
      section: 'examen',
      ressourceId: enregistre.id,
      description: `Demande d'examen "${dto.libelle}" pour l'enfant #${enfantId}.`,
    });

    return { message: 'Examen demande avec succes.', examen: this.formaterExamen(enregistre) };
  }

  // Enregistre ou met a jour le resultat d'un examen.
  async enregistrerResultatExamen(enfantId: string, examenId: string, dto: ModifierExamenEnfantDto) {
    const examen = await this.examensRepository.findOne({ where: { id: examenId, enfantId } });
    if (!examen) throw new NotFoundException(`Examen #${examenId} introuvable.`);

    Object.assign(examen, {
      statut: dto.statut ?? examen.statut,
      resultat: typeof dto.resultat !== 'undefined' ? dto.resultat : examen.resultat,
      dateResultat: typeof dto.dateResultat !== 'undefined' ? dto.dateResultat : examen.dateResultat,
      dateExamen: typeof dto.dateExamen !== 'undefined' ? dto.dateExamen : examen.dateExamen,
      notes: typeof dto.notes !== 'undefined' ? dto.notes : examen.notes,
      modifiePar: dto.utilisateurNom ?? null,
    });

    const enregistre = await this.examensRepository.save(examen);

    this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'MODIFICATION',
      module: 'ENFANTS',
      section: 'examen',
      ressourceId: examenId,
      description: `R\u00e9sultat enregistr\u00e9 pour l'examen #${examenId} de l'enfant #${enfantId}.`,
    });

    return { message: 'Examen mis a jour.', examen: this.formaterExamen(enregistre) };
  }

  private formaterExamen(examen: ExamenEnfantEntity) {
    return {
      id: examen.id,
      enfantId: examen.enfantId,
      suiviEnfantId: examen.suiviEnfantId,
      typeExamen: examen.typeExamen,
      libelle: examen.libelle,
      statut: examen.statut,
      source: examen.source,
      resultat: examen.resultat,
      dateExamen: examen.dateExamen,
      dateResultat: examen.dateResultat,
      notes: examen.notes,
      prisEnChargeLe: examen.prisEnChargeLe,
      envoyeLe: examen.envoyeLe,
      creeLe: examen.creeLe,
      enregistrePar: examen.enregistrePar,
      modifiePar: examen.modifiePar,
    };
  }
}
