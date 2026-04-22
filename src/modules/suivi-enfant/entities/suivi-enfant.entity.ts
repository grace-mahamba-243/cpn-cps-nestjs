import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EnfantEntity } from '../../enfants/entities/enfant.entity';

// Cette entite represente une consultation de suivi clinique d un enfant (0-59 mois).
@Entity('suivis_enfants')
export class SuiviEnfantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'enfant_id', type: 'char', length: 36 })
  enfantId: string;

  @ManyToOne(() => EnfantEntity, (e) => e.suivis)
  @JoinColumn({ name: 'enfant_id' })
  enfant: EnfantEntity;

  @Column({ name: 'date_visite', type: 'date' })
  dateVisite: string;

  // Age de l enfant en mois au moment du suivi
  @Column({ name: 'age_mois', type: 'int', nullable: true })
  ageMois: number | null;

  // --- Constantes vitales ---
  @Column({ name: 'poids_kg', type: 'decimal', precision: 5, scale: 3, nullable: true })
  poidsKg: number | null;

  @Column({ name: 'taille_cm', type: 'decimal', precision: 5, scale: 1, nullable: true })
  tailleCm: number | null;

  @Column({ name: 'perimetre_cranien_cm', type: 'decimal', precision: 4, scale: 1, nullable: true })
  perimetreCranienCm: number | null;

  @Column({ name: 'perimetre_brachial_cm', type: 'decimal', precision: 4, scale: 1, nullable: true })
  perimetreBrachialCm: number | null;

  @Column({ name: 'temperature_celsius', type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperatureCelsius: number | null;

  @Column({ name: 'frequence_cardiaque', type: 'int', nullable: true })
  frequenceCardiaque: number | null;

  @Column({ name: 'frequence_respiratoire', type: 'int', nullable: true })
  frequenceRespiratoire: number | null;

  // --- Etat clinique ---
  // BON | PASSABLE | MAUVAIS
  @Column({ name: 'etat_general', type: 'varchar', length: 20, nullable: true })
  etatGeneral: string | null;

  // NORMALE | PALEUR | ICTERE | CYANOSE
  @Column({ name: 'couleur_peau', type: 'varchar', length: 20, nullable: true })
  couleurPeau: string | null;

  @Column({ name: 'oedemes', type: 'boolean', default: false })
  oedemes: boolean;

  @Column({ name: 'deshydratation', type: 'boolean', default: false })
  deshydratation: boolean;

  // NORMAL | RETARD_LEGER | RETARD_MODERE | RETARD_SEVERE
  @Column({ name: 'developpement_psychomoteur', type: 'varchar', length: 30, nullable: true })
  developpementPsychomoteur: string | null;

  // --- Digestion / alimentation ---
  // EXCLUSIF | MIXTE | ARTIFICIEL | DIVERSIFIE | NORMAL
  @Column({ type: 'varchar', length: 20, nullable: true })
  allaitement: string | null;

  // --- Motif et diagnostics ---
  @Column({ type: 'text', nullable: true })
  motif: string | null;

  @Column({ type: 'text', nullable: true })
  diagnostics: string | null;

  @Column({ name: 'conduite_a_tenir', type: 'text', nullable: true })
  conduiteATenir: string | null;

  @Column({ name: 'traitement_prescrit', type: 'text', nullable: true })
  traitementPrescrit: string | null;

  @Column({ name: 'prochain_rdv_date', type: 'date', nullable: true })
  prochainRdvDate: string | null;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  @Column({ name: 'enregistre_par', type: 'varchar', length: 200, nullable: true })
  enregistrePar: string | null;

  @Column({ name: 'modifie_par', type: 'varchar', length: 200, nullable: true })
  modifiePar: string | null;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
