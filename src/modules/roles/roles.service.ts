import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../auth/entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';

function normaliserCodeRole(valeur: string) {
  return valeur
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

// Ce service centralise la logique metier du module roles branche sur MySQL.
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
  ) {}

  async findAll() {
    const roles = await this.rolesRepository.find({
      where: [
        { code: 'ADMIN' },
        { code: 'MEDECIN' },
        { code: 'SAGE_FEMME' },
        { code: 'INFIRMIERE' },
        { code: 'LABORANTIN' },
        { code: 'RECEPTION' },
      ],
      order: {
        libelle: 'ASC',
      },
    });

    return {
      message: 'Liste des roles chargee avec succes.',
      roles: roles.map((role) => ({
        id: role.id,
        code: role.code,
        libelle: role.libelle,
      })),
    };
  }

  async create(createRoleDto: CreateRoleDto) {
    const code = normaliserCodeRole(createRoleDto.code || createRoleDto.libelle);

    if (!code) {
      throw new ConflictException('Le code du role est invalide.');
    }

    const roleExistant = await this.rolesRepository.findOne({ where: { code } });

    if (roleExistant) {
      throw new ConflictException('Un role avec ce code existe deja.');
    }

    const role = this.rolesRepository.create({
      code,
      libelle: createRoleDto.libelle.trim(),
    });

    const roleSauvegarde = await this.rolesRepository.save(role);

    return {
      message: 'Role cree avec succes.',
      role: {
        id: roleSauvegarde.id,
        code: roleSauvegarde.code,
        libelle: roleSauvegarde.libelle,
      },
    };
  }
}
