import { Controller, Get } from '@nestjs/common';
import { PharmacieService } from './pharmacie.service';

// Ce controleur expose un point d'entree minimal pour le module pharmacie.
@Controller('pharmacie')
export class PharmacieController {
  constructor(private readonly pharmacieService: PharmacieService) {}

  @Get()
  findAll() {
    return this.pharmacieService.findAll();
  }
}
