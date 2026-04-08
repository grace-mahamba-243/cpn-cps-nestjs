import { Controller, Get } from '@nestjs/common';
import { GrossessesService } from './grossesses.service';

// Ce controleur expose un point d'entree minimal pour le module grossesses.
@Controller('grossesses')
export class GrossessesController {
  constructor(private readonly grossessesService: GrossessesService) {}

  @Get()
  findAll() {
    return this.grossessesService.findAll();
  }
}
