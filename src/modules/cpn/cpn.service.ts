import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module cpn.
@Injectable()
export class CpnService {
  findAll() {
    return {
      module: 'cpn',
      status: 'ready',
      message: 'Socle backend initialise pour le module cpn.',
    };
  }
}
