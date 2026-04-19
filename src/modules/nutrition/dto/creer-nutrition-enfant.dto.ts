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

// DTO de creation d une evaluation nutritionnelle enfant.
export class CreerNutritionEnfantDto {
  @IsUUID()
  enfantId: string;

  @IsDateString()
  dateEvaluation: string;

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
  perimetreBrachialCm?: number;

  @IsOptional()
  @IsIn(['NORMAL', 'MAM', 'MAS', 'SURPOIDS', 'OBESE'])
  statutNutritionnel?: string;

  @IsOptional()
  @IsNumber()
  zScorePoidsAge?: number;

  @IsOptional()
  @IsNumber()
  zScoreTailleAge?: number;

  @IsOptional()
  @IsNumber()
  zScorePoidsT?: number;

  @IsOptional()
  @IsIn(['EXCLUSIF', 'MIXTE', 'ARTIFICIEL', 'DIVERSIFIE'])
  typeAlimentation?: string;

  @IsOptional()
  @IsBoolean()
  diversificationDemarree?: boolean;

  @IsOptional()
  @IsBoolean()
  oedemes?: boolean;

  @IsOptional()
  @IsIn(['AUCUNE', 'SUPPLEMENTATION', 'THERAPEUTIQUE', 'RENVOI'])
  priseEnCharge?: string;

  @IsOptional()
  @IsString()
  alimentTherapeutique?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}
