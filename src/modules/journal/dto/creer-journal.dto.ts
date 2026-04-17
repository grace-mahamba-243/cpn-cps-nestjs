// DTO pour enregistrer une action dans le journal
export class CreerJournalDto {
  utilisateurId?: string;
  utilisateurNom?: string;
  typeAction: 'CREATION' | 'MODIFICATION' | 'SUPPRESSION' | 'CONSULTATION';
  module: string;
  section?: string;
  ressourceId?: string;
  description: string;
  meta?: Record<string, unknown>;
}
