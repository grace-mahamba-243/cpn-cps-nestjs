import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { PatienteEntity } from './entities/patiente.entity';
import { CreerPatienteDto } from './dto/creer-patiente.dto';

// Ce service centralise la logique metier du module patientes (dossiers administratifs meres).
@Injectable()
export class PatientesService {
  constructor(
    @InjectRepository(PatienteEntity)
    private readonly patientesRepository: Repository<PatienteEntity>,
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
  async creer(dto: CreerPatienteDto): Promise<PatienteEntity> {
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
    return this.patientesRepository.save(entite);
  }

  // Met a jour un dossier administratif patiente.
  async modifier(id: string, dto: Partial<CreerPatienteDto>): Promise<PatienteEntity> {
    const patiente = await this.findOne(id);
    Object.assign(patiente, dto);
    return this.patientesRepository.save(patiente);
  }
}
