import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// Ce DTO valide les donnees pour enregistrer un contact de suivi CPN.
export class CreerContactCpnDto {
  @IsDateString()
  dateContact!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  ageGestationnel?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  poids?: number | null;

  @IsOptional()
  @IsInt()
  tensionSystolique?: number | null;

  @IsOptional()
  @IsInt()
  tensionDiastolique?: number | null;

  @IsOptional()
  @IsNumber()
  temperature?: number | null;

  @IsOptional()
  @IsNumber()
  hauteurUterine?: number | null;

  @IsOptional()
  @IsInt()
  frequenceCardiaqueMore?: number | null;

  @IsOptional()
  @IsInt()
  bfc?: number | null;

  @IsOptional()
  @IsIn(['CEPHALIQUE', 'PODALIQUE', 'TRANSVERSE'])
  presentationFoetale?: string | null;

  @IsOptional()
  @IsBoolean()
  mouvementsActifs?: boolean | null;

  @IsOptional()
  @IsBoolean()
  oedemes?: boolean | null;

  @IsOptional()
  @IsBoolean()
  varices?: boolean | null;

  @IsOptional()
  @IsIn(['BON', 'PASSABLE', 'CRITIQUE'])
  etatGeneral?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perimetreBrachial?: number | null;

  @IsOptional()
  @IsIn(['NEGATIF', 'TRACES', '1+', '2+', '3+'])
  proteInurie?: string | null;

  @IsOptional()
  @IsBoolean()
  paleur?: boolean | null;

  @IsOptional()
  @IsBoolean()
  ecoulementVaginal?: boolean | null;

  @IsOptional()
  @IsBoolean()
  ulcerationsGenitales?: boolean | null;

  @IsOptional()
  @IsString()
  etatDuCol?: string | null;

  @IsOptional()
  @IsString()
  observations?: string | null;

  @IsOptional()
  @IsString()
  traitementPrescrit?: string | null;

  @IsOptional()
  @IsDateString()
  prochainRdvDate?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  prochainRdvNotes?: string | null;

  // Identification de l'utilisateur qui effectue l'action (pour le journal)
  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
