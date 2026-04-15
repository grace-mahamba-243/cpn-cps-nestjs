import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

// Ce DTO valide les donnees pour enregistrer ou modifier le resultat d un examen CPN.
export class ModifierExamenCpnDto {
  @IsOptional()
  @IsIn(['DEMANDE', 'RESULTAT_RECU'])
  statut?: string;

  @IsOptional()
  @IsIn(['INTERNE', 'EXTERNE'])
  source?: string;

  @IsOptional()
  @IsString()
  resultat?: string | null;

  @IsOptional()
  @IsDateString()
  dateResultat?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
