import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

// DTO de creation d un accouchement : valide toutes les donnees reçues du formulaire.
export class CreerAccouchementDto {
  // Accepte soit le numero de dossier de la mere (AFIA-...) soit l UUID interne
  @IsOptional()
  @IsString()
  numeroDossierMere?: string;

  @IsOptional()
  @IsString()
  patienteId?: string;

  @IsOptional()
  @IsUUID()
  dossierCpnId?: string;

  @IsIn(['INTERNE', 'EXTERNE'])
  typeAccouchement: string;

  @IsDateString()
  dateAccouchement: string;

  @IsOptional()
  @IsInt()
  @Min(20)
  ageGestationnel?: number;

  @IsIn(['NATUREL', 'CESARIENNE', 'INSTRUMENTAL', 'SIEGE', 'AUTRE'])
  modeAccouchement: string;

  @IsIn(['STABLE', 'COMPLICATION', 'DECES'])
  etatMere: string;

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

  @IsIn(['VIVANT', 'MORT_NE', 'DECES_PRECOCE'])
  etatNouveauNe: string;

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
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
