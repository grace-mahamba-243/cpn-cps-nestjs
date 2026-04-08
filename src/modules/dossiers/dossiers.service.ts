import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module dossiers.
@Injectable()
export class DossiersService {
  findAll() {
    return {
      module: 'dossiers',
      status: 'ready',
      message: 'Socle backend initialise pour le module dossiers.',
    };
  }
}
