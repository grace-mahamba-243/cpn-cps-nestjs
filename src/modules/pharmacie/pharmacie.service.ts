import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module pharmacie.
@Injectable()
export class PharmacieService {
  findAll() {
    return {
      module: 'pharmacie',
      status: 'ready',
      message: 'Socle backend initialise pour le module pharmacie.',
    };
  }
}
