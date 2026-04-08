import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module patientes.
@Injectable()
export class PatientesService {
  findAll() {
    return {
      module: 'patientes',
      status: 'ready',
      message: 'Socle backend initialise pour le module patientes.',
    };
  }
}
