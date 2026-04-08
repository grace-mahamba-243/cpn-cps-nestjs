import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module users.
@Injectable()
export class UsersService {
  findAll() {
    return {
      module: 'users',
      status: 'ready',
      message: 'Socle backend initialise pour le module users.',
    };
  }
}
