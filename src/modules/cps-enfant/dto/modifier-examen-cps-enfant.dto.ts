import { IsDateString, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// Ce DTO valide les donnees pour modifier un examen dans le cadre du suivi postnatal enfant.
export class ModifierExamenCpsEnfantDto {
  @IsOptional()
  @IsIn(['BIOLOGIQUE', 'ECHOGRAPHIE', 'AUTRE'])
  typeExamen?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  libelle?: string;

  @IsOptional()
  @IsIn(['DEMANDE', 'EN_COURS', 'RESULTAT_RECU', 'RESULTAT_ENVOYE'])
  statut?: string;

  @IsOptional()
  @IsString()
  resultat?: string | null;

  @IsOptional()
  @IsString()
  interpretation?: string | null;

  @IsOptional()
  @IsDateString()
  dateResultat?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
