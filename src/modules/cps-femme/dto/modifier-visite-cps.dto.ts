import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// Ce DTO valide les donnees pour modifier une visite CPS postnatale existante.
export class ModifierVisiteCpsDto {
  @IsOptional()
  @IsDateString()
  dateVisite?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  poids?: number | null;

  @IsOptional()
  @IsInt()
  tensionSystolique?: number | null;

  @IsOptional()
  @IsInt()
  tensionDiastolique?: number | null;

  @IsOptional()
  @IsNumber()
  temperature?: number | null;

  @IsOptional()
  @IsInt()
  frequenceCardiaque?: number | null;

  @IsOptional()
  @IsIn(['BON', 'PASSABLE', 'CRITIQUE'])
  etatGeneral?: string | null;

  @IsOptional()
  @IsIn(['BONNE', 'INCOMPLETE', 'ABSENTE'])
  involutionUterine?: string | null;

  @IsOptional()
  @IsIn(['NORMAL', 'ENGORGEMENT', 'CREVASSES', 'MASTITE'])
  etatSeins?: string | null;

  @IsOptional()
  @IsIn(['EXCLUSIF', 'MIXTE', 'ARTIFICIEL', 'ABSENT'])
  allaitement?: string | null;

  @IsOptional()
  @IsIn(['BONNE_CICATRISATION', 'INFECTION', 'DEHISCENCE', 'NON_APPLICABLE'])
  etatPlaie?: string | null;

  @IsOptional()
  @IsIn(['ABSENTS', 'NORMAUX', 'ABONDANTS'])
  saignements?: string | null;

  @IsOptional()
  @IsIn(['NORMALES', 'ABONDANTES', 'MALODORANTES', 'ABSENTES'])
  lochies?: string | null;

  @IsOptional()
  @IsIn(['NORMAL', 'BABY_BLUES', 'DEPRESSION_SUSPECTEE'])
  etatPsychologique?: string | null;

  @IsOptional()
  @IsBoolean()
  oedemes?: boolean | null;

  @IsOptional()
  @IsBoolean()
  paleur?: boolean | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perimetreBrachial?: number | null;

  @IsOptional()
  @IsBoolean()
  contraceptionDiscutee?: boolean;

  @IsOptional()
  @IsString()
  methodeContraceptive?: string | null;

  @IsOptional()
  @IsString()
  conduiteATenir?: string | null;

  @IsOptional()
  @IsString()
  traitementPrescrit?: string | null;

  @IsOptional()
  @IsDateString()
  prochainRdvDate?: string | null;

  @IsOptional()
  @IsString()
  observations?: string | null;

  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
