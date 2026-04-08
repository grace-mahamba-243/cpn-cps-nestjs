import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module roles.
@Injectable()
export class RolesService {
  findAll() {
    return {
      module: 'roles',
      status: 'ready',
      message: 'Socle backend initialise pour le module roles.',
    };
  }
}
