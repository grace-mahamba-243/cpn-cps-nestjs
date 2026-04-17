import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { EnfantEntity } from './entities/enfant.entity';
import { CreerEnfantDto } from './dto/creer-enfant.dto';

// Ce service centralise la logique metier du module enfants (dossiers administratifs enfants).
@Injectable()
export class EnfantsService {
  constructor(
    @InjectRepository(EnfantEntity)
    private readonly enfantsRepository: Repository<EnfantEntity>,
  ) {}

  // Retourne la liste des enfants avec recherche optionnelle.
  async findAll(recherche?: string): Promise<EnfantEntity[]> {
    if (recherche && recherche.trim()) {
      const terme = recherche.trim();
      return this.enfantsRepository.find({
        where: [
          { nom: Like(`%${terme}%`) },
          { postnom: Like(`%${terme}%`) },
          { prenom: Like(`%${terme}%`) },
          { nomMere: Like(`%${terme}%`) },
          { telephone: Like(`%${terme}%`) },
          { numeroFiche: Like(`%${terme}%`) },
        ],
        order: { nom: 'ASC' },
      });
    }
    return this.enfantsRepository.find({ order: { nom: 'ASC' } });
  }

  // Retourne un enfant par son identifiant ou leve une exception 404.
  async findOne(id: string): Promise<EnfantEntity> {
    const enfant = await this.enfantsRepository.findOne({ where: { id } });
    if (!enfant) {
      throw new NotFoundException(`Enfant #${id} introuvable.`);
    }
    return enfant;
  }

  // Cree un nouveau dossier administratif enfant.
  // Leve une ConflictException si le numero de fiche existe deja
  // ou si un enfant avec le meme nom, postnom, date de naissance et mere est deja enregistre.
  async creer(dto: CreerEnfantDto): Promise<EnfantEntity> {
    const ficheExistante = await this.enfantsRepository.findOne({
      where: { numeroFiche: dto.numeroFiche },
    });
    if (ficheExistante) {
      throw new ConflictException(
        `Le numero de fiche "${dto.numeroFiche}" est deja utilise par un autre enfant.`,
      );
    }

    const doublonIdentite = await this.enfantsRepository.findOne({
      where: {
        nom: dto.nom.trim(),
        postnom: dto.postnom.trim(),
        dateNaissance: dto.dateNaissance,
        nomMere: dto.nomMere.trim(),
      },
    });
    if (doublonIdentite) {
      throw new ConflictException(
        `Un enfant avec le nom "${dto.nom} ${dto.postnom}", la date de naissance ${dto.dateNaissance} et la mere "${dto.nomMere}" existe deja (fiche #${doublonIdentite.numeroFiche}).`,
      );
    }

    const entite = this.enfantsRepository.create({
      numeroFiche: dto.numeroFiche,
      nom: dto.nom,
      postnom: dto.postnom,
      prenom: dto.prenom ?? null,
      sexe: dto.sexe,
      dateNaissance: dto.dateNaissance,
      nomMere: dto.nomMere,
      nomPere: dto.nomPere ?? null,
      telephone: dto.telephone,
      adresse: dto.adresse,
      dateEnregistrement: dto.dateEnregistrement,
    });
    return this.enfantsRepository.save(entite);
  }
}
