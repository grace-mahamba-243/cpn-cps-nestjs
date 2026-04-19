import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

// DTO de creation d un dossier enfant complet (identite + naissance + administratif).
export class CreerEnfantDto {
  @IsString()
  @Length(1, 30)
  numeroDossier: string;

  // --- Identite ---
  @IsString()
  @Length(1, 100)
  nom: string;

  @IsString()
  @Length(1, 100)
  postnom: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  prenom?: string;

  @IsIn(['M', 'F'])
  sexe: string;

  @IsDateString()
  dateNaissance: string;

  // --- Lien mere (optionnel) ---
  @IsOptional()
  @IsUUID()
  patienteId?: string;

  // --- Informations de naissance ---
  @IsOptional()
  @IsIn(['INTERNE', 'EXTERNE'])
  lieuNaissance?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
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
  @IsIn(['VIVANT', 'MORT_NE', 'DECES_PRECOCE'])
  etatNaissance?: string;

  @IsOptional()
  @IsInt()
  @Min(22)
  ageGestationnelSemaines?: number;

  // --- Administratif ---
  @IsString()
  @Length(1, 100)
  nomMere: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  nomPere?: string;

  @IsString()
  @Length(1, 30)
  telephone: string;

  @IsString()
  @Length(1, 200)
  adresse: string;

  @IsDateString()
  dateEnregistrement: string;
}
