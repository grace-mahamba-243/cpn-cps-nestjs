import { IsDateString, Matches , IsOptional , IsString } from 'class-validator';

// DTO pour reprogrammer un rendez-vous avec une nouvelle date et heure.
export class ReprogrammerRendezVousDto {
  // Nouvelle date au format YYYY-MM-DD
  @IsDateString()
  dateRdv: string;

  // Nouvelle heure au format HH:mm
  @Matches(/^\d{2}:\d{2}$/, { message: 'L heure doit etre au format HH:mm' })
  heureRdv: string;
  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
