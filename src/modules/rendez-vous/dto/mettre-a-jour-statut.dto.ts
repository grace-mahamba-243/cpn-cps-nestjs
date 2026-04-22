import { IsIn, IsOptional, IsString } from 'class-validator';

// DTO de mise a jour du statut d un rendez-vous (ex: marquer l arrivee d un patient).
export class MettreAJourStatutDto {
  // Statut cible du rendez-vous
  @IsIn(['EN_ATTENTE', 'PROGRAMME', 'CONFIRME', 'ARRIVE', 'TERMINE', 'ANNULE', 'REPROGRAMME'])
  statut: string;

  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
}
