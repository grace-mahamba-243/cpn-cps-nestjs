import { IsDateString, IsIn, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

// DTO de creation d un dossier administratif enfant.
export class CreerEnfantDto {
  @IsString()
  @Length(1, 30)
  numeroFiche: string;

  @IsString()
  @Length(1, 100)
  nom: string;

  @IsString()
  @Length(1, 100)
  postnom: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  prenom?: string;

  @IsIn(['M', 'F'])
  sexe: string;

  @IsDateString()
  dateNaissance: string;

  @IsString()
  @Length(1, 100)
  nomMere: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  nomPere?: string;

  @IsString()
  @Length(1, 30)
  telephone: string;

  @IsString()
  @Length(1, 200)
  adresse: string;

  @IsDateString()
  dateEnregistrement: string;
}
