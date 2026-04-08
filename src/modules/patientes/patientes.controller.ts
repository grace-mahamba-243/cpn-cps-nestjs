import { Controller, Get } from '@nestjs/common';
import { PatientesService } from './patientes.service';

// Ce controleur expose un point d'entree minimal pour le module patientes.
@Controller('patientes')
export class PatientesController {
  constructor(private readonly patientesService: PatientesService) {}

  @Get()
  findAll() {
    return this.patientesService.findAll();
  }
}
