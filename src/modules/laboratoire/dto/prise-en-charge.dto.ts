import { IsOptional, IsString } from 'class-validator';

// DTO pour la prise en charge d'une demande d'examen par le laborantin.
export class PriseEnChargeDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
