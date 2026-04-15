import { IsOptional, IsString, MinLength } from 'class-validator';

// Ce DTO valide les informations minimales pour creer un role backend.
export class CreateRoleDto {
  @IsString()
  @MinLength(3)
  libelle!: string;

  @IsOptional()
  @IsString()
  code?: string;
}
