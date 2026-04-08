import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module rendez-vous.
@Injectable()
export class RendezVousService {
  findAll() {
    return {
      module: 'rendez-vous',
      status: 'ready',
      message: 'Socle backend initialise pour le module rendez-vous.',
    };
  }
}
