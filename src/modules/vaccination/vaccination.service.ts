import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module vaccination.
@Injectable()
export class VaccinationService {
  findAll() {
    return {
      module: 'vaccination',
      status: 'ready',
      message: 'Socle backend initialise pour le module vaccination.',
    };
  }
}
