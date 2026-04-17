import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// DTO pour la saisie et l'envoi du resultat d'un examen par le laborantin.
export class SaisirResultatDto {
  @IsString()
  @IsNotEmpty()
  resultat: string;

  @IsOptional()
  @IsDateString()
  dateExamen?: string;

  @IsOptional()
  @IsDateString()
  dateResultat?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
