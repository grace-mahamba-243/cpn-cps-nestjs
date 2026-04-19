import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

// Ce DTO valide les donnees pour modifier (resultat, statut) un examen enfant.
export class ModifierExamenEnfantDto {
  @IsOptional()
  @IsIn(['DEMANDE', 'EN_COURS', 'RESULTAT_RECU', 'RESULTAT_ENVOYE'])
  statut?: string;

  @IsOptional()
  @IsString()
  resultat?: string | null;

  @IsOptional()
  @IsDateString()
  dateExamen?: string | null;

  @IsOptional()
  @IsDateString()
  dateResultat?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
