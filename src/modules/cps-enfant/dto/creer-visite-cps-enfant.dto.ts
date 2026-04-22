import { IsBoolean, IsDateString, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

// DTO de création d une visite CPS Enfant.
export class CreerVisiteCpsEnfantDto {
  @IsNotEmpty()
  @IsString()
  dossierCpsEnfantId: string;

  @IsNotEmpty()
  @IsIn(['SIX_HEURES', 'SIX_JOURS', 'SIX_SEMAINES', 'M2', 'M3', 'M6', 'M9', 'M12', 'SURPRISE'])
  typeVisite: string;

  @IsNotEmpty()
  @IsDateString()
  dateVisite: string;

  @IsOptional()
  @IsInt()
  ageJours?: number;

  @IsOptional()
  @IsNumber()
  poidsKg?: number;

  @IsOptional()
  @IsNumber()
  tailleCm?: number;

  @IsOptional()
  @IsNumber()
  perimetreCranienCm?: number;

  @IsOptional()
  @IsNumber()
  temperatureCelsius?: number;

  @IsOptional()
  @IsInt()
  frequenceCardiaque?: number;

  @IsOptional()
  @IsInt()
  frequenceRespiratoire?: number;

  @IsOptional()
  @IsIn(['BON', 'PASSABLE', 'CRITIQUE'])
  etatGeneral?: string;

  @IsOptional()
  @IsIn(['EXCLUSIF', 'MIXTE', 'ARTIFICIEL', 'ABSENT'])
  allaitement?: string;

  @IsOptional()
  @IsBoolean()
  priseBiberon?: boolean;

  @IsOptional()
  @IsIn(['NORMAL', 'PALE', 'ICTERIQUE', 'CYANIQUE'])
  couleurPeau?: string;

  @IsOptional()
  @IsBoolean()
  oedemes?: boolean;

  @IsOptional()
  @IsString()
  infectionCutanee?: string;

  @IsOptional()
  @IsBoolean()
  ictere?: boolean;

  @IsOptional()
  @IsBoolean()
  convulsions?: boolean;

  @IsOptional()
  @IsIn(['NORMAL', 'INFECTE', 'DETACHE'])
  etatCordon?: string;

  @IsOptional()
  @IsIn(['NORMAL', 'RETARDE', 'AVANCE'])
  developpementPsychomoteur?: string;

  @IsOptional()
  @IsString()
  vaccinsAdministres?: string;

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
  prochainTypeVisite?: string;

  @IsOptional()
  @IsString()
  agentSante?: string;

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
