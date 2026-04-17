import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Cette entite enregistre chaque action effectuee par un utilisateur sur n'importe quel dossier.
@Entity('journal_activites')
export class JournalActiviteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Identifiant de l'utilisateur qui a effectue l'action
  @Column({ name: 'utilisateur_id', type: 'char', length: 36, nullable: true })
  utilisateurId: string | null;

  // Nom affiché de l'utilisateur au moment de l'action (snapshot)
  @Column({ name: 'utilisateur_nom', type: 'varchar', length: 200, nullable: true })
  utilisateurNom: string | null;

  // Type d'action : CREATION | MODIFICATION | SUPPRESSION | CONSULTATION
  @Column({ name: 'type_action', type: 'varchar', length: 30 })
  typeAction: string;

  // Module concerné : CPN | RENDEZ_VOUS | PATIENTES | UTILISATEURS | etc.
  @Column({ type: 'varchar', length: 50 })
  module: string;

  // Section spécifique dans le module : CONTACT | DOSSIER | EXAMEN | etc.
  @Column({ type: 'varchar', length: 50, nullable: true })
  section: string | null;

  // Identifiant de la ressource concernée
  @Column({ name: 'ressource_id', type: 'varchar', length: 36, nullable: true })
  ressourceId: string | null;

  // Description lisible de l'action
  @Column({ type: 'text' })
  description: string;

  // Métadonnées optionnelles (JSON stringifié)
  @Column({ type: 'text', nullable: true })
  meta: string | null;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;
}
