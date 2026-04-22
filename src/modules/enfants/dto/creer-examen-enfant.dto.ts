import { IsDateString, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// Ce DTO valide les donnees pour demander un examen pour un enfant.
export class CreerExamenEnfantDto {
  @IsOptional()
  @IsString()
  suiviEnfantId?: string | null;

  @IsIn(['BIOLOGIQUE', 'ECHOGRAPHIE', 'AUTRE'])
  typeExamen!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  libelle!: string;

  @IsOptional()
  @IsIn(['INTERNE', 'EXTERNE'])
  source?: string;

  @IsOptional()
  @IsDateString()
  dateExamen?: string | null;

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
