import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module enfants.
@Injectable()
export class EnfantsService {
  findAll() {
    return {
      module: 'enfants',
      status: 'ready',
      message: 'Socle backend initialise pour le module enfants.',
    };
  }
}
