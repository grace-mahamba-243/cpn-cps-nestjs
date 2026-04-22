import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { PatienteEntity } from './entities/patiente.entity';
import { CreerPatienteDto } from './dto/creer-patiente.dto';
import { JournalService } from '../journal/journal.service';

// Genere un numero de dossier unique au format AFIA-{annee}-{2lettresNom}{increment3chiffres}
// Exemple : AFIA-2026-MU001

// Ce service centralise la logique metier du module patientes (dossiers administratifs meres).
@Injectable()
export class PatientesService {
  constructor(
    @InjectRepository(PatienteEntity)
    private readonly patientesRepository: Repository<PatienteEntity>,
    private readonly journalService: JournalService,
  ) {}

  // Retourne la liste des patientes avec recherche optionnelle.
  async findAll(recherche?: string): Promise<PatienteEntity[]> {
    if (recherche && recherche.trim()) {
      const terme = recherche.trim();
      return this.patientesRepository.find({
        where: [
          { nom: Like(`%${terme}%`) },
          { postnom: Like(`%${terme}%`) },
          { prenom: Like(`%${terme}%`) },
          { telephone: Like(`%${terme}%`) },
          { numeroDossier: Like(`%${terme}%`) },
        ],
        order: { nom: 'ASC' },
      });
    }
    return this.patientesRepository.find({ order: { nom: 'ASC' } });
  }

  // Retourne une patiente par son identifiant ou leve une exception 404.
  async findOne(id: string): Promise<PatienteEntity> {
    const patiente = await this.patientesRepository.findOne({ where: { id } });
    if (!patiente) {
      throw new NotFoundException(`Patiente #${id} introuvable.`);
    }
    return patiente;
  }

  // Retourne une patiente par son numero de dossier ou null si introuvable.
  async findByNumeroDossier(numeroDossier: string): Promise<PatienteEntity | null> {
    return this.patientesRepository.findOne({ where: { numeroDossier } });
  }

  // Genere automatiquement un numeroDossier unique : AFIA-{annee}-{2lettres}{increment 3 chiffres}
  private async genererNumeroDossier(nom: string): Promise<string> {
    const annee = new Date().getFullYear();
    const prefixeNom = nom
      .trim()
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 2)
      .padEnd(2, 'X');
    const base = `AFIA-${annee}-${prefixeNom}`;

    // Compter les dossiers existants avec ce prefixe pour determiner le prochain increment
    const count = await this.patientesRepository
      .createQueryBuilder('p')
      .where('p.numero_dossier LIKE :base', { base: `${base}%` })
      .getCount();

    const increment = String(count + 1).padStart(3, '0');
    const candidat = `${base}${increment}`;

    // Verification anti-collision (cas rare de concurrence)
    const existant = await this.patientesRepository.findOne({ where: { numeroDossier: candidat } });
    if (existant) {
      // Incrementer jusqu a trouver un numero libre
      let n = count + 2;
      while (true) {
        const suivant = `${base}${String(n).padStart(3, '0')}`;
        const doublon = await this.patientesRepository.findOne({ where: { numeroDossier: suivant } });
        if (!doublon) return suivant;
        n++;
      }
    }
    return candidat;
  }

  // Cree un nouveau dossier administratif patiente.
  // - Genere automatiquement le numeroDossier au format AFIA-{annee}-{2lettres}{increment}
  // - Refuse si nom+postnom+prenom sont identiques a une patiente existante
  // - Refuse si le telephone principal est deja utilise par une autre patiente
  async creer(dto: CreerPatienteDto): Promise<PatienteEntity> {
    // Unicite : nom + postnom + prenom tous les trois identiques
    const prenomRecherche = dto.prenom ? dto.prenom.trim() : null;
    const doublonIdentite = await this.patientesRepository
      .createQueryBuilder('p')
      .where('p.nom = :nom AND p.postnom = :postnom AND (p.prenom = :prenom OR (p.prenom IS NULL AND :prenom IS NULL))', {
        nom: dto.nom.trim(),
        postnom: dto.postnom.trim(),
        prenom: prenomRecherche,
      })
      .getOne();
    if (doublonIdentite) {
      throw new ConflictException(
        `Une patiente avec le nom "${dto.nom} ${dto.postnom} ${dto.prenom ?? ''}" existe déjà (dossier #${doublonIdentite.numeroDossier}).`,
      );
    }

    // Unicite : telephone principal
    const doublonTel = await this.patientesRepository.findOne({
      where: { telephone: dto.telephone.trim() },
    });
    if (doublonTel) {
      throw new ConflictException(
        `Le numéro de téléphone "${dto.telephone}" est déjà utilisé par ${doublonTel.nom} ${doublonTel.postnom} (dossier #${doublonTel.numeroDossier}).`,
      );
    }

    // Generation automatique du numeroDossier
    const numeroDossier = await this.genererNumeroDossier(dto.nom);

    const entite = this.patientesRepository.create({
      numeroDossier,
      nom: dto.nom,
      postnom: dto.postnom,
      prenom: dto.prenom ?? null,
      dateNaissance: dto.dateNaissance,
      age: dto.age ?? 0,
      adresse: dto.adresse,
      telephone: dto.telephone,
      etatMatrimonial: dto.etatMatrimonial,
      nomPartenaire: dto.nomPartenaire ?? null,
      occupationFemme: dto.occupationFemme ?? null,
      occupationHomme: dto.occupationHomme ?? null,
      personneUrgence: dto.personneUrgence,
      telephoneUrgence: dto.telephoneUrgence,
      adresseUrgence: dto.adresseUrgence,
      dateEnregistrement: dto.dateEnregistrement,
      enregistrePar: dto.utilisateurNom ?? null,
    });
    const enregistre = await this.patientesRepository.save(entite);

    void this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'CREATION',
      module: 'Patientes',
      section: 'Dossier administratif',
      ressourceId: enregistre.id,
      description: `Création du dossier de ${enregistre.nom} ${enregistre.postnom} (${enregistre.numeroDossier})`,
    });

    return enregistre;
  }

  // Met a jour un dossier administratif patiente.
  async modifier(id: string, dto: Partial<CreerPatienteDto>): Promise<PatienteEntity> {
    const patiente = await this.findOne(id);
    Object.assign(patiente, dto);
    patiente.modifiePar = dto.utilisateurNom ?? null;
    const enregistre = await this.patientesRepository.save(patiente);

    void this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'MODIFICATION',
      module: 'Patientes',
      section: 'Dossier administratif',
      ressourceId: enregistre.id,
      description: `Modification du dossier de ${enregistre.nom} ${enregistre.postnom} (${enregistre.numeroDossier})`,
    });

    return enregistre;
  }
}
