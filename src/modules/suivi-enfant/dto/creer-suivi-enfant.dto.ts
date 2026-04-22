import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

// DTO de creation d une visite de suivi enfant.
export class CreerSuiviEnfantDto {
  @IsUUID()
  enfantId: string;

  @IsDateString()
  dateVisite: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(59)
  ageMois?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  poidsKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tailleCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perimetreCranienCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perimetreBrachialCm?: number;

  @IsOptional()
  @IsNumber()
  temperatureCelsius?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  frequenceCardiaque?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  frequenceRespiratoire?: number;

  @IsOptional()
  @IsIn(['BON', 'PASSABLE', 'MAUVAIS'])
  etatGeneral?: string;

  @IsOptional()
  @IsIn(['NORMALE', 'PALEUR', 'ICTERE', 'CYANOSE'])
  couleurPeau?: string;

  @IsOptional()
  @IsBoolean()
  oedemes?: boolean;

  @IsOptional()
  @IsBoolean()
  deshydratation?: boolean;

  @IsOptional()
  @IsIn(['NORMAL', 'RETARD_LEGER', 'RETARD_MODERE', 'RETARD_SEVERE'])
  developpementPsychomoteur?: string;

  @IsOptional()
  @IsIn(['EXCLUSIF', 'MIXTE', 'ARTIFICIEL', 'DIVERSIFIE', 'NORMAL'])
  allaitement?: string;

  @IsOptional()
  @IsString()
  motif?: string;

  @IsOptional()
  @IsString()
  diagnostics?: string;

  @IsOptional()
  @IsString()
  conduiteATenir?: string;

  @IsOptional()
  @IsString()
  traitementPrescrit?: string;

  @IsOptional()
  @IsDateString()
  prochainRdvDate?: string;

  @IsOptional()
  @IsString()
  observations?: string;
  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
