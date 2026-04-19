import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

// DTO d enregistrement d une dose de vaccin.
export class EnregistrerVaccinationDoseDto {
  @IsOptional()
  @IsUUID()
  enfantId?: string;

  @IsString()
  @Length(1, 50)
  vaccin: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numeroDose?: number;

  @IsDateString()
  dateAdministration: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(59)
  ageMois?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  numeroLot?: string;

  @IsOptional()
  @IsIn(['ADMINISTREE', 'DIFFEREE', 'REFUSEE'])
  statut?: string;

  @IsOptional()
  @IsString()
  motifReport?: string;

  @IsOptional()
  @IsDateString()
  prochaineDoseDate?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  administrePar?: string;
}
