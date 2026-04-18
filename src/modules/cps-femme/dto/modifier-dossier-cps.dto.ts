import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// Ce DTO valide les donnees pour modifier un dossier CPS Femme existant.
export class ModifierDossierCpsDto {
  @IsOptional()
  @IsIn(['OUVERT', 'CLOS'])
  statut?: string;

  @IsOptional()
  @IsIn(['STABLE', 'COMPLICATION'])
  etatMereEntree?: string;

  @IsOptional()
  @IsString()
  complicationsAccouchement?: string | null;

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
