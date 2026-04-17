// Ce DTO décrit les données du contact courant envoyées pour l'analyse clinique assistée.
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class AnalyserContactCpnDto {
  @IsOptional()
  @IsNumber()
  ageGestationnel?: number;

  @IsOptional()
  @IsNumber()
  poids?: number;

  @IsOptional()
  @IsNumber()
  tensionSystolique?: number;

  @IsOptional()
  @IsNumber()
  tensionDiastolique?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  hauteurUterine?: number;

  @IsOptional()
  @IsNumber()
  frequenceCardiaqueMore?: number;

  @IsOptional()
  @IsNumber()
  bfc?: number;

  @IsOptional()
  @IsString()
  presentationFoetale?: string;

  @IsOptional()
  @IsBoolean()
  mouvementsActifs?: boolean;

  @IsOptional()
  @IsBoolean()
  oedemes?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['BON', 'PASSABLE', 'CRITIQUE'])
  etatGeneral?: string;

  @IsOptional()
  @IsNumber()
  perimetreBrachial?: number;

  @IsOptional()
  @IsString()
  @IsIn(['NEGATIF', 'TRACES', '1+', '2+', '3+'])
  proteInurie?: string;

  @IsOptional()
  @IsBoolean()
  paleur?: boolean;

  @IsOptional()
  @IsBoolean()
  ecoulementVaginal?: boolean;

  @IsOptional()
  @IsBoolean()
  ulcerationsGenitales?: boolean;
}
