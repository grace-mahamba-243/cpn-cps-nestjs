import { IsBoolean, IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

// Ce DTO valide les informations minimales requises pour creer un utilisateur.
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  nomComplet!: string;

  @IsString()
  @IsIn(['M', 'F'])
  sexe!: string;

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

  @IsString()
  roleCode!: string;

  @IsString()
  @MinLength(4)
  motDePasseInitial!: string;

  @IsBoolean()
  actif!: boolean;
}