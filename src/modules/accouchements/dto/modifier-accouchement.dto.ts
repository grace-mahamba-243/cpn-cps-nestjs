import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

// DTO de modification partielle d un accouchement : tous les champs sont optionnels.
export class ModifierAccouchementDto {
  @IsOptional()
  @IsIn(['INTERNE', 'EXTERNE'])
  typeAccouchement?: string;

  @IsOptional()
  @IsDateString()
  dateAccouchement?: string;

  @IsOptional()
  @IsInt()
  @Min(20)
  ageGestationnel?: number;

  @IsOptional()
  @IsIn(['NATUREL', 'CESARIENNE', 'INSTRUMENTAL', 'SIEGE', 'AUTRE'])
  modeAccouchement?: string;

  @IsOptional()
  @IsIn(['STABLE', 'COMPLICATION', 'DECES'])
  etatMere?: string;

  @IsOptional()
  @IsString()
  complicationsMere?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  perteSanguineMl?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  nombreNouveauxNes?: number;

  @IsOptional()
  @IsIn(['VIVANT', 'MORT_NE', 'DECES_PRECOCE'])
  etatNouveauNe?: string;

  @IsOptional()
  @IsIn(['MASCULIN', 'FEMININ', 'INCONNU'])
  sexeNouveauNe?: string;

  @IsOptional()
  @IsInt()
  @Min(200)
  poidsNaissanceG?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  scoreApgar1min?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  scoreApgar5min?: number;

  @IsOptional()
  @IsString()
  anomaliesCongenitales?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
