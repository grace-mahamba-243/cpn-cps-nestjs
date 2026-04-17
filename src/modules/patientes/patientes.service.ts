import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { PatienteEntity } from './entities/patiente.entity';
import { CreerPatienteDto } from './dto/creer-patiente.dto';
import { JournalService } from '../journal/journal.service';

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

  // Cree un nouveau dossier administratif patiente.
  // Leve une ConflictException si le numero de dossier existe deja
  // ou si une patiente avec le meme nom, postnom et date de naissance est deja enregistree.
  async creer(dto: CreerPatienteDto): Promise<PatienteEntity> {
    const dossierExistant = await this.patientesRepository.findOne({
      where: { numeroDossier: dto.numeroDossier },
    });
    if (dossierExistant) {
      throw new ConflictException(
        `Le numero de dossier "${dto.numeroDossier}" est deja utilise par une autre patiente.`,
      );
    }

    const doublonIdentite = await this.patientesRepository.findOne({
      where: {
        nom: dto.nom.trim(),
        postnom: dto.postnom.trim(),
        dateNaissance: dto.dateNaissance,
      },
    });
    if (doublonIdentite) {
      throw new ConflictException(
        `Une patiente avec le nom "${dto.nom} ${dto.postnom}" et la date de naissance ${dto.dateNaissance} existe deja (dossier #${doublonIdentite.numeroDossier}).`,
      );
    }

    const entite = this.patientesRepository.create({
      numeroDossier: dto.numeroDossier,
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
