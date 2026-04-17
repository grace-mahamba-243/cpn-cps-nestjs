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
  @IsIn(['EN_ATTENTE', 'PROGRAMME', 'CONFIRME', 'ARRIVE', 'TERMINE', 'ANNULE', 'REPROGRAMME', 'SURPRISE'])
  statut?: string;

  // Filtrer par type de rendez-vous
  @IsOptional()
  @IsIn(['PROGRAMME', 'SURPRISE'])
  typeRdv?: string;

  // Filtrer par service de destination
  @IsOptional()
  @IsString()
  serviceDestination?: string;

  // Recherche libre sur le nom du patient ou la reference du dossier
  @IsOptional()
  @IsString()
  recherche?: string;
}
