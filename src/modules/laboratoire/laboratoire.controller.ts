import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { LaboratoireService } from './laboratoire.service';
import { PriseEnChargeDto } from './dto/prise-en-charge.dto';
import { SaisirResultatDto } from './dto/saisir-resultat.dto';

// Ce controleur expose les endpoints REST du module laboratoire.
@Controller('laboratoire')
export class LaboratoireController {
  constructor(private readonly laboratoireService: LaboratoireService) {}

  // Lister toutes les demandes (filtrage optionnel par statut)
  @Get()
  listerDemandes(@Query('statut') statut?: string) {
    return this.laboratoireService.listerToutesDemandes(statut);
  }

  // Demandes en attente (statut DEMANDE)
  @Get('en-attente')
  listerEnAttente() {
    return this.laboratoireService.listerDemandesEnAttente();
  }

  // Demandes en cours de traitement (statut EN_COURS)
  @Get('en-cours')
  listerEnCours() {
    return this.laboratoireService.listerDemandesEnCours();
  }

  // Historique des demandes traitees (RESULTAT_ENVOYE | RESULTAT_RECU)
  @Get('historique')
  listerHistorique() {
    return this.laboratoireService.listerHistorique();
  }

  // Detail d'une demande
  @Get(':examenId')
  obtenirDemande(@Param('examenId') examenId: string) {
    return this.laboratoireService.obtenirDemande(examenId);
  }

  // Prise en charge d'une demande par le laborantin
  @Patch(':examenId/prise-en-charge')
  prendreEnCharge(@Param('examenId') examenId: string, @Body() dto: PriseEnChargeDto) {
    return this.laboratoireService.prendreEnCharge(examenId, dto);
  }

  // Saisie du resultat et envoi vers le module clinique
  @Patch(':examenId/resultat')
  saisirResultat(@Param('examenId') examenId: string, @Body() dto: SaisirResultatDto) {
    return this.laboratoireService.saisirEtEnvoyerResultat(examenId, dto);
  }
}
