import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { RoleEntity } from '../auth/entities/role.entity';
import { UtilisateurAuthEntity } from '../auth/entities/utilisateur-auth.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Ce service centralise la logique metier de base du module users.
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UtilisateurAuthEntity)
    private readonly utilisateursRepository: Repository<UtilisateurAuthEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
  ) {}

  async findAll() {
    const utilisateurs = await this.utilisateursRepository.find({
      relations: ['role'],
      order: {
        nomAffichage: 'ASC',
      },
    });

    return {
      module: 'users',
      status: 'ready',
      message: 'Liste des utilisateurs chargee depuis MySQL.',
      utilisateurs: utilisateurs.map((utilisateur) => this.formaterUtilisateur(utilisateur)),
    };
  }

  async findOne(id: string) {
    const utilisateur = await this.recupererUtilisateurOuErreur(id);

    return {
      message: 'Detail utilisateur charge avec succes.',
      utilisateur: this.formaterUtilisateur(utilisateur),
    };
  }

  async create(createUserDto: CreateUserDto) {
    const role = await this.rolesRepository.findOne({
      where: {
        code: createUserDto.roleCode.trim().toUpperCase(),
      },
    });

    if (!role) {
      throw new NotFoundException('Le role selectionne est introuvable.');
    }

    const emailNormalise = createUserDto.email?.trim().toLowerCase() || null;
    if (emailNormalise) {
      const emailExistant = await this.utilisateursRepository.findOne({
        where: { email: emailNormalise },
      });
      if (emailExistant) {
        throw new ConflictException(
          `L'adresse email "${emailNormalise}" est deja utilisee par un autre utilisateur.`,
        );
      }
    }

    const identifiant = await this.genererIdentifiant(createUserDto.nomComplet);
    const utilisateur = this.utilisateursRepository.create({
      identifiant,
      nomAffichage: createUserDto.nomComplet.trim(),
      sexe: createUserDto.sexe?.trim().toUpperCase() ?? null,
      dateNaissance: createUserDto.dateNaissance ?? null,
      telephone: createUserDto.telephone?.trim() || null,
      email: createUserDto.email?.trim().toLowerCase() || null,
      adresse: createUserDto.adresse?.trim() || null,
      unite: createUserDto.unite?.trim() || null,
      motDePasseHash: createUserDto.motDePasseInitial.trim(),
      actif: createUserDto.actif,
      dernierAccesAt: null,
      role,
    });

    const utilisateurEnregistre = await this.utilisateursRepository.save(utilisateur);

    return {
      message: 'Utilisateur cree avec succes.',
      utilisateur: this.formaterUtilisateur({
        ...utilisateurEnregistre,
        role,
      }),
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const utilisateur = await this.recupererUtilisateurOuErreur(id);

    let role = utilisateur.role;
    if (updateUserDto.roleCode) {
      const roleTrouve = await this.rolesRepository.findOne({
        where: {
          code: updateUserDto.roleCode.trim().toUpperCase(),
        },
      });

      if (!roleTrouve) {
        throw new NotFoundException('Le role selectionne est introuvable.');
      }

      role = roleTrouve;
    }

    if (typeof updateUserDto.email !== 'undefined') {
      const emailNormalise = updateUserDto.email?.trim().toLowerCase() || null;
      if (emailNormalise && emailNormalise !== utilisateur.email) {
        const emailExistant = await this.utilisateursRepository.findOne({
          where: { email: emailNormalise, id: Not(id) },
        });
        if (emailExistant) {
          throw new ConflictException(
            `L'adresse email "${emailNormalise}" est deja utilisee par un autre utilisateur.`,
          );
        }
      }
    }

    Object.assign(utilisateur, {
      nomAffichage: updateUserDto.nomComplet?.trim() || utilisateur.nomAffichage,
      sexe: updateUserDto.sexe ? updateUserDto.sexe.trim().toUpperCase() : utilisateur.sexe,
      dateNaissance:
        typeof updateUserDto.dateNaissance !== 'undefined'
          ? updateUserDto.dateNaissance
          : utilisateur.dateNaissance,
      telephone:
        typeof updateUserDto.telephone !== 'undefined'
          ? updateUserDto.telephone?.trim() || null
          : utilisateur.telephone,
      email: (() => {
        if (typeof updateUserDto.email === 'undefined') return utilisateur.email;
        return updateUserDto.email?.trim().toLowerCase() || null;
      })(),
      adresse:
        typeof updateUserDto.adresse !== 'undefined'
          ? updateUserDto.adresse?.trim() || null
          : utilisateur.adresse,
      unite:
        typeof updateUserDto.unite !== 'undefined'
          ? updateUserDto.unite?.trim() || null
          : utilisateur.unite,
      actif: typeof updateUserDto.actif === 'boolean' ? updateUserDto.actif : utilisateur.actif,
      motDePasseHash: updateUserDto.motDePasseInitial?.trim() || utilisateur.motDePasseHash,
      role,
    });

    const utilisateurEnregistre = await this.utilisateursRepository.save(utilisateur);

    return {
      message: 'Utilisateur modifie avec succes.',
      utilisateur: this.formaterUtilisateur({
        ...utilisateurEnregistre,
        role,
      }),
    };
  }

  async remove(id: string) {
    const utilisateur = await this.recupererUtilisateurOuErreur(id);

    await this.utilisateursRepository.remove(utilisateur);

    return {
      id,
      message: 'Utilisateur supprimé avec succès.',
    };
  }

  private formaterUtilisateur(utilisateur: UtilisateurAuthEntity) {
    return {
      id: utilisateur.id,
      identifiant: utilisateur.identifiant,
      nomAffichage: utilisateur.nomAffichage,
      role: utilisateur.role.libelle,
      roleCode: utilisateur.role.code,
      actif: utilisateur.actif,
      dernierAccesAt: utilisateur.dernierAccesAt,
      sexe: utilisateur.sexe,
      dateNaissance: utilisateur.dateNaissance,
      telephone: utilisateur.telephone,
      email: utilisateur.email,
      adresse: utilisateur.adresse,
      unite: utilisateur.unite,
    };
  }

  private async recupererUtilisateurOuErreur(id: string) {
    const utilisateur = await this.utilisateursRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!utilisateur) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return utilisateur;
  }

  private async genererIdentifiant(nomComplet: string) {
    const base = nomComplet
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '');

    const prefixe = base || 'utilisateur';
    let suffixe = 1;
    let identifiant = `${prefixe}.${suffixe}`;

    while (
      await this.utilisateursRepository.exists({
        where: { identifiant },
      })
    ) {
      suffixe += 1;
      identifiant = `${prefixe}.${suffixe}`;
    }

    return identifiant;
  }
}
