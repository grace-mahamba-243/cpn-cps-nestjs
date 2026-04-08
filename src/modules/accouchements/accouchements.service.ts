import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module accouchements.
@Injectable()
export class AccouchementsService {
  findAll() {
    return {
      module: 'accouchements',
      status: 'ready',
      message: 'Socle backend initialise pour le module accouchements.',
    };
  }
}
