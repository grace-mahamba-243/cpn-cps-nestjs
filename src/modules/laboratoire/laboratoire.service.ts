import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module laboratoire.
@Injectable()
export class LaboratoireService {
  findAll() {
    return {
      module: 'laboratoire',
      status: 'ready',
      message: 'Socle backend initialise pour le module laboratoire.',
    };
  }
}
