// DTO pour l'analyse IA d'une visite postnatale CPS.
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class AnalyserVisiteCpsDto {
  @IsOptional()
  @IsString()
  etatGeneral?: string;

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
  frequenceCardiaque?: number;

  @IsOptional()
  @IsNumber()
  perimetreBrachial?: number;

  @IsOptional()
  @IsString()
  involutionUterine?: string;

  @IsOptional()
  @IsString()
  etatSeins?: string;

  @IsOptional()
  @IsString()
  allaitement?: string;

  @IsOptional()
  @IsString()
  etatPlaie?: string;

  @IsOptional()
  @IsString()
  saignements?: string;

  @IsOptional()
  @IsString()
  lochies?: string;

  @IsOptional()
  @IsString()
  etatPsychologique?: string;

  @IsOptional()
  @IsBoolean()
  oedemes?: boolean;

  @IsOptional()
  @IsBoolean()
  paleur?: boolean;

  @IsOptional()
  @IsString()
  typeVisite?: string;
}
