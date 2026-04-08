import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module grossesses.
@Injectable()
export class GrossessesService {
  findAll() {
    return {
      module: 'grossesses',
      status: 'ready',
      message: 'Socle backend initialise pour le module grossesses.',
    };
  }
}
