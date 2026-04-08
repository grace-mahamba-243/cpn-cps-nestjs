import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module suivi-enfant.
@Injectable()
export class SuiviEnfantService {
  findAll() {
    return {
      module: 'suivi-enfant',
      status: 'ready',
      message: 'Socle backend initialise pour le module suivi-enfant.',
    };
  }
}
