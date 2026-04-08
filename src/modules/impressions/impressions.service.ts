import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module impressions.
@Injectable()
export class ImpressionsService {
  findAll() {
    return {
      module: 'impressions',
      status: 'ready',
      message: 'Socle backend initialise pour le module impressions.',
    };
  }
}
