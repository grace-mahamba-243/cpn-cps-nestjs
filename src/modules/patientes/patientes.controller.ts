import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PatientesService } from './patientes.service';
import { CreerPatienteDto } from './dto/creer-patiente.dto';

// Ce controleur expose les endpoints CRUD du module patientes.
@Controller('patientes')
export class PatientesController {
  constructor(private readonly patientesService: PatientesService) {}

  // Retourne la liste des patientes avec recherche optionnelle.
  @Get()
  findAll(@Query('recherche') recherche?: string) {
    return this.patientesService.findAll(recherche);
  }

  // Retourne le detail d une patiente par son identifiant.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientesService.findOne(id);
  }

  // Cree un nouveau dossier administratif patiente.
  @Post()
  creer(@Body() dto: CreerPatienteDto) {
    return this.patientesService.creer(dto);
  }

  // Met a jour un dossier administratif patiente.
  @Patch(':id')
  modifier(@Param('id') id: string, @Body() dto: Partial<CreerPatienteDto>) {
    return this.patientesService.modifier(id, dto);
  }
}
