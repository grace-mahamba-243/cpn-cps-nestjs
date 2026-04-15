import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CpnService } from './cpn.service';
import { CreerDossierCpnDto } from './dto/creer-dossier-cpn.dto';
import { ModifierDossierCpnDto } from './dto/modifier-dossier-cpn.dto';
import { CreerContactCpnDto } from './dto/creer-contact-cpn.dto';
import { ModifierContactCpnDto } from './dto/modifier-contact-cpn.dto';
import { CreerExamenCpnDto } from './dto/creer-examen-cpn.dto';
import { ModifierExamenCpnDto } from './dto/modifier-examen-cpn.dto';

// Ce controleur expose les endpoints REST du module CPN.
@Controller('cpn')
export class CpnController {
  constructor(private readonly cpnService: CpnService) {}

  // --- Dossiers CPN ---

  @Get()
  listerDossiers(@Query('recherche') recherche?: string) {
    return this.cpnService.listerDossiers(recherche);
  }

  @Post()
  ouvrirDossier(@Body() dto: CreerDossierCpnDto) {
    return this.cpnService.ouvrirDossier(dto);
  }

  @Get(':dossierId')
  obtenirDossier(@Param('dossierId') dossierId: string) {
    return this.cpnService.obtenirDossier(dossierId);
  }

  @Patch(':dossierId')
  modifierDossier(@Param('dossierId') dossierId: string, @Body() dto: ModifierDossierCpnDto) {
    return this.cpnService.modifierDossier(dossierId, dto);
  }

  // --- Contacts CPN ---

  @Post(':dossierId/contacts')
  ajouterContact(@Param('dossierId') dossierId: string, @Body() dto: CreerContactCpnDto) {
    return this.cpnService.ajouterContact(dossierId, dto);
  }

  @Get(':dossierId/contacts/:contactId')
  obtenirContact(@Param('dossierId') dossierId: string, @Param('contactId') contactId: string) {
    return this.cpnService.obtenirContact(dossierId, contactId);
  }

  @Patch(':dossierId/contacts/:contactId')
  modifierContact(
    @Param('dossierId') dossierId: string,
    @Param('contactId') contactId: string,
    @Body() dto: ModifierContactCpnDto,
  ) {
    return this.cpnService.modifierContact(dossierId, contactId, dto);
  }

  // --- Examens CPN ---

  @Get(':dossierId/examens')
  listerExamens(@Param('dossierId') dossierId: string) {
    return this.cpnService.listerExamens(dossierId);
  }

  @Post(':dossierId/examens')
  demanderExamen(@Param('dossierId') dossierId: string, @Body() dto: CreerExamenCpnDto) {
    return this.cpnService.demanderExamen(dossierId, dto);
  }

  @Patch(':dossierId/examens/:examenId')
  enregistrerResultatExamen(
    @Param('dossierId') dossierId: string,
    @Param('examenId') examenId: string,
    @Body() dto: ModifierExamenCpnDto,
  ) {
    return this.cpnService.enregistrerResultatExamen(dossierId, examenId, dto);
  }
}
