import { IsDateString, IsIn, IsInt, IsOptional, IsString, Length, Matches, Min } from 'class-validator';

// DTO de creation d un dossier administratif patiente.
export class CreerPatienteDto {
  @IsString()
  @Length(1, 30)
  numeroDossier: string;

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

  @IsDateString()
  dateNaissance: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsString()
  @Length(1, 200)
  adresse: string;

  @IsString()
  @Length(1, 30)
  telephone: string;

  @IsIn(['Mariee', 'Celibataire', 'Veuve', 'Separee', 'Union libre'])
  etatMatrimonial: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  nomPartenaire?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  occupationFemme?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  occupationHomme?: string;

  @IsString()
  @Length(1, 100)
  personneUrgence: string;

  @IsString()
  @Length(1, 30)
  telephoneUrgence: string;

  @IsString()
  @Length(1, 200)
  adresseUrgence: string;

  @IsDateString()
  dateEnregistrement: string;

  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
