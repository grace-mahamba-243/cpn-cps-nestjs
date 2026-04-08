import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module cps-femme.
@Injectable()
export class CpsFemmeService {
  findAll() {
    return {
      module: 'cps-femme',
      status: 'ready',
      message: 'Socle backend initialise pour le module cps-femme.',
    };
  }
}
