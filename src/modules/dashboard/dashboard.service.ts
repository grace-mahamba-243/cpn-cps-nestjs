import { Injectable } from '@nestjs/common';

// Ce service centralise la logique metier de base du module dashboard.
@Injectable()
export class DashboardService {
  findAll() {
    return {
      module: 'dashboard',
      status: 'ready',
      message: 'Socle backend initialise pour le module dashboard.',
    };
  }
}
