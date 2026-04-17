import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

// DTO de filtres pour la liste des rendez-vous. Tous les champs sont optionnels.
export class FiltresListeRendezVousDto {
  // Filtrer par date exacte (YYYY-MM-DD)
  @IsOptional()
  @IsDateString()
  date?: string;

  // Filtrer a partir d une date (YYYY-MM-DD)
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  // Filtrer jusqu a une date (YYYY-MM-DD)
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  // Filtrer par statut exact
  @IsOptional()
  @IsIn(['EN_ATTENTE', 'PROGRAMME', 'CONFIRME', 'ARRIVE', 'TERMINE', 'ANNULE', 'REPROGRAMME'])
  statut?: string;

  // Filtrer par service de destination
  @IsOptional()
  @IsString()
  serviceDestination?: string;

  // Filtrer par reference de dossier (permet de recuperer l historique d un patient)
  @IsOptional()
  @IsString()
  refDossier?: string;

  // Recherche libre sur le nom du patient ou la reference du dossier
  @IsOptional()
  @IsString()
  recherche?: string;
}
