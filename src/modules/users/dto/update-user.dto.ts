import { IsBoolean, IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

// Ce DTO valide les champs modifiables d un profil utilisateur existant.
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  nomComplet?: string;

  @IsOptional()
  @IsString()
  @IsIn(['M', 'F'])
  sexe?: string;

  @IsOptional()
  @IsDateString()
  dateNaissance?: string | null;

  @IsOptional()
  @IsString()
  telephone?: string | null;

  @IsOptional()
  @IsString()
  email?: string | null;

  @IsOptional()
  @IsString()
  adresse?: string | null;

  @IsOptional()
  @IsString()
  unite?: string | null;

  @IsOptional()
  @IsString()
  roleCode?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  motDePasseInitial?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}