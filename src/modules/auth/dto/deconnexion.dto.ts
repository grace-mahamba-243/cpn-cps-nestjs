import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Ce DTO transporte les informations minimales pour fermer une session utilisateur.
export class DeconnexionDto {
  @IsString()
  @IsNotEmpty()
  identifiant!: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}