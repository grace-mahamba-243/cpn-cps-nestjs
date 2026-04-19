import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VaccinationService } from './vaccination.service';
import { EnregistrerVaccinationDoseDto } from './dto/enregistrer-vaccination-dose.dto';

// Ce controleur expose les endpoints du module vaccination enfant.
@Controller('enfants')
export class VaccinationController {
  constructor(private readonly vaccinationService: VaccinationService) {}

  // Retourne le calendrier vaccinal d un enfant.
  @Get(':enfantId/vaccinations')
  findByEnfant(@Param('enfantId') enfantId: string) {
    return this.vaccinationService.findByEnfant(enfantId);
  }

  // Retourne le detail d une dose.
  @Get('vaccinations/:id')
  findOne(@Param('id') id: string) {
    return this.vaccinationService.findOne(id);
  }

  // Enregistre une dose de vaccin.
  @Post(':enfantId/vaccinations')
  enregistrer(@Param('enfantId') enfantId: string, @Body() dto: EnregistrerVaccinationDoseDto) {
    return this.vaccinationService.enregistrer({ ...dto, enfantId });
  }
}
