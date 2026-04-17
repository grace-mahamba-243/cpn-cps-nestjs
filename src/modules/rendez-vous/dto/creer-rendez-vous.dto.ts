import { IsDateString, IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';

// DTO de creation d un rendez-vous. Valide les champs obligatoires et les valeurs acceptees.
export class CreerRendezVousDto {
  // Date au format YYYY-MM-DD
  @IsDateString()
  dateRdv: string;

  // Heure au format HH:mm
  @Matches(/^\d{2}:\d{2}$/, { message: 'L heure doit etre au format HH:mm' })
  heureRdv: string;

  // Motif clinique ou administratif du rendez-vous
  @IsString()
  @Length(1, 100)
  motif: string;

  // Statut initial du rendez-vous
  @IsOptional()
  @IsIn(['EN_ATTENTE', 'PROGRAMME', 'CONFIRME', 'ARRIVE'])
  statut?: string;

  // Type du rendez-vous (toujours PROGRAMME desormais)
  @IsOptional()
  @IsIn(['PROGRAMME'])
  typeRdv?: string;

  // Nom complet du patient concerné
  @IsString()
  @Length(1, 200)
  nomPatient: string;

  // Initiales courtes du patient (ex: MK)
  @IsString()
  @Length(1, 10)
  initialesPatient: string;

  // Type de patient : Mere ou Enfant
  @IsOptional()
  @IsIn(['Mere', 'Enfant'])
  typePatient?: string;

  // Reference du dossier (optionnelle pour les surprises)
  @IsOptional()
  @IsString()
  @Length(1, 20)
  refDossier?: string;

  // Service de destination (ex: Maternite (CPN), Pediatrie (CPS))
  @IsOptional()
  @IsString()
  @Length(1, 60)
  serviceDestination?: string;

  // Observations complementaires (tension, suivi special, etc.)
  @IsOptional()
  @IsString()
  observations?: string;

  // Nom de l agent qui cree le rendez-vous
  @IsOptional()
  @IsString()
  @Length(1, 200)
  creePar?: string;
}
