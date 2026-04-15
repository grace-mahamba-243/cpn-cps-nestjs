import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { EnfantsService } from './enfants.service';
import { CreerEnfantDto } from './dto/creer-enfant.dto';

// Ce controleur expose les endpoints CRUD du module enfants.
@Controller('enfants')
export class EnfantsController {
  constructor(private readonly enfantsService: EnfantsService) {}

  // Retourne la liste des enfants avec recherche optionnelle.
  @Get()
  findAll(@Query('recherche') recherche?: string) {
    return this.enfantsService.findAll(recherche);
  }

  // Retourne le detail d un enfant par son identifiant.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enfantsService.findOne(id);
  }

  // Cree un nouveau dossier administratif enfant.
  @Post()
  creer(@Body() dto: CreerEnfantDto) {
    return this.enfantsService.creer(dto);
  }
}
