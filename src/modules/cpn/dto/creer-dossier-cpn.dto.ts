import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// Ce DTO valide les donnees requises pour ouvrir un dossier CPN.
export class CreerDossierCpnDto {
  // Accepte soit le numero de dossier de la mere (AFIA-...) soit l UUID interne
  @IsOptional()
  @IsString()
  numeroDossierMere?: string;

  @IsOptional()
  @IsString()
  patienteId?: string;

  @IsDateString()
  dateOuverture!: string;

  @IsInt()
  @Min(0)
  gestite!: number;

  @IsInt()
  @Min(0)
  parite!: number;

  @IsInt()
  @Min(0)
  nombreAvortements!: number;

  @IsOptional()
  @IsDateString()
  derniersRegles?: string | null;

  @IsOptional()
  @IsDateString()
  dateProbableAccouchement?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  ageGestionnelOuverture?: number | null;

  @IsOptional()
  @IsString()
  antecedentsMedicaux?: string | null;

  @IsOptional()
  @IsString()
  antecedentsChirurgicaux?: string | null;

  @IsOptional()
  @IsString()
  antecedentsGynecologiques?: string | null;

  @IsOptional()
  @IsString()
  antecedentsObstetricaux?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  allergies?: string | null;

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
  @IsArray()
  @IsString({ each: true })
  facteursRisque?: string[] | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taille?: number | null;

  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
