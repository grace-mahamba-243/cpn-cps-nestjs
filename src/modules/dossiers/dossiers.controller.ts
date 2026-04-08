import { Controller, Get } from '@nestjs/common';
import { DossiersService } from './dossiers.service';

// Ce controleur expose un point d'entree minimal pour le module dossiers.
@Controller('dossiers')
export class DossiersController {
  constructor(private readonly dossiersService: DossiersService) {}

  @Get()
  findAll() {
    return this.dossiersService.findAll();
  }
}
