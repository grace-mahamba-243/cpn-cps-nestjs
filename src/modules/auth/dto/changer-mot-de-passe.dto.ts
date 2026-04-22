import { IsString, MinLength } from 'class-validator';

// Ce DTO valide le changement obligatoire du mot de passe au premier acces.
export class ChangerMotDePasseDto {
  @IsString()
  identifiant!: string;

  @IsString()
  @MinLength(4)
  motDePasseActuel!: string;

  @IsString()
  @MinLength(4)
  nouveauMotDePasse!: string;
}