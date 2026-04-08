import { IsNotEmpty, IsString, MinLength } from 'class-validator';

// Ce DTO valide les informations minimales attendues pour une connexion utilisateur.
export class ConnexionDto {
  @IsString()
  @IsNotEmpty()
  identifiant!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  motDePasse!: string;
}