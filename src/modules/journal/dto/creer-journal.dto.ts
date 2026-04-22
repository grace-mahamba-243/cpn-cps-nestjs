import { IsOptional, IsString } from 'class-validator';

// DTO pour enregistrer une action dans le journal
export class CreerJournalDto {
  @IsOptional()
  @IsString()
  utilisateurId?: string;

  @IsOptional()
  @IsString()
  utilisateurNom?: string;
  typeAction: 'CREATION' | 'MODIFICATION' | 'SUPPRESSION' | 'CONSULTATION';
  module: string;
  section?: string;
  ressourceId?: string;
  description: string;
  meta?: Record<string, unknown>;
}
