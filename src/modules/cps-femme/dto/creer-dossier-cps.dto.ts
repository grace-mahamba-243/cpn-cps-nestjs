import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// Ce DTO valide les donnees pour ouvrir un dossier CPS Femme.
export class CreerDossierCpsDto {
  @IsString()
  patienteId!: string;

  @IsDateString()
  dateOuverture!: string;

  @IsDateString()
  dateAccouchement!: string;

  @IsIn(['INTERNE', 'EXTERNE'])
  typeAccouchementEntree!: string;

  @IsOptional()
  @IsString()
  accouchementId?: string | null;

  @IsOptional()
  @IsString()
  dossierCpnId?: string | null;

  @IsIn(['NATUREL', 'CESARIENNE', 'INSTRUMENTAL', 'SIEGE', 'AUTRE'])
  modeAccouchement!: string;

  @IsIn(['STABLE', 'COMPLICATION'])
  etatMereEntree!: string;

  @IsOptional()
  @IsString()
  complicationsAccouchement?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  nombreNouveauxNes?: number;

  @IsIn(['VIVANT', 'MORT_NE', 'DECES_PRECOCE'])
  etatNouveauNe!: string;

  @IsOptional()
  @IsIn(['MASCULIN', 'FEMININ', 'INDETERMINE'])
  sexeNouveauNe?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  poidsNaissanceG?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  scoreApgar1min?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  scoreApgar5min?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  gestite?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  parite?: number;

  @IsOptional()
  @IsIn(['A', 'B', 'AB', 'O'])
  groupeSanguin?: string | null;

  @IsOptional()
  @IsIn(['+', '-'])
  rhesus?: string | null;

  @IsOptional()
  @IsIn(['POSITIF', 'NEGATIF', 'INCONNU'])
  vihStatut?: string;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
