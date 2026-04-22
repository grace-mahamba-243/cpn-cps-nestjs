import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

// DTO de création d un dossier CPS Enfant.
export class CreerDossierCpsEnfantDto {
  @IsNotEmpty()
  @IsString()
  enfantId: string;

  @IsNotEmpty()
  @IsString()
  numeroDossierCps: string;

  @IsNotEmpty()
  @IsDateString()
  dateOuverture: string;

  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @IsOptional()
  @IsIn(['INTERNE', 'EXTERNE'])
  typeAccouchement?: string;

  @IsOptional()
  @IsInt()
  @Min(0) @Max(6000)
  poidsNaissanceG?: number;

  @IsOptional()
  @IsInt()
  @Min(0) @Max(10)
  scoreApgar1min?: number;

  @IsOptional()
  @IsInt()
  @Min(0) @Max(10)
  scoreApgar5min?: number;

  @IsOptional()
  @IsString()
  groupeSanguin?: string;

  @IsOptional()
  @IsString()
  rhesus?: string;

  @IsOptional()
  @IsIn(['NEGATIF', 'POSITIF', 'INCONNU', 'EXPOSE'])
  vihStatut?: string;

  @IsOptional()
  @IsString()
  mereNom?: string;

  @IsOptional()
  @IsString()
  mereTelephone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
