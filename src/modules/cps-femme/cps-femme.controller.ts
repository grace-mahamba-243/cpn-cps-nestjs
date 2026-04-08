import { Controller, Get } from '@nestjs/common';
import { CpsFemmeService } from './cps-femme.service';

// Ce controleur expose un point d'entree minimal pour le module cps-femme.
@Controller('cps-femme')
export class CpsFemmeController {
  constructor(private readonly cpsFemmeService: CpsFemmeService) {}

  @Get()
  findAll() {
    return this.cpsFemmeService.findAll();
  }
}
