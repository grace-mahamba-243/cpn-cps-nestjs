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

// Cette entite represente une evaluation nutritionnelle d un enfant.
@Entity('nutritions_enfants')
export class NutritionEnfantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'enfant_id', type: 'char', length: 36 })
  enfantId: string;

  @ManyToOne(() => EnfantEntity, (e) => e.nutritions)
  @JoinColumn({ name: 'enfant_id' })
  enfant: EnfantEntity;

  @Column({ name: 'date_evaluation', type: 'date' })
  dateEvaluation: string;

  @Column({ name: 'age_mois', type: 'int', nullable: true })
  ageMois: number | null;

  // --- Anthropometrie ---
  @Column({ name: 'poids_kg', type: 'decimal', precision: 5, scale: 3, nullable: true })
  poidsKg: number | null;

  @Column({ name: 'taille_cm', type: 'decimal', precision: 5, scale: 1, nullable: true })
  tailleCm: number | null;

  @Column({ name: 'perimetre_brachial_cm', type: 'decimal', precision: 4, scale: 1, nullable: true })
  perimetreBrachialCm: number | null;

  // --- Statut nutritionnel ---
  // NORMAL | MAM | MAS | SURPOIDS | OBESE
  @Column({ name: 'statut_nutritionnel', type: 'varchar', length: 20, nullable: true })
  statutNutritionnel: string | null;

  // Z-score poids/age
  @Column({ name: 'z_score_poids_age', type: 'decimal', precision: 5, scale: 2, nullable: true })
  zScorePoidsAge: number | null;

  // Z-score taille/age
  @Column({ name: 'z_score_taille_age', type: 'decimal', precision: 5, scale: 2, nullable: true })
  zScoreTailleAge: number | null;

  // Z-score poids/taille
  @Column({ name: 'z_score_poids_taille', type: 'decimal', precision: 5, scale: 2, nullable: true })
  zScorePoidsT: number | null;

  // --- Alimentation ---
  // EXCLUSIF | MIXTE | ARTIFICIEL | DIVERSIFIE
  @Column({ name: 'type_alimentation', type: 'varchar', length: 20, nullable: true })
  typeAlimentation: string | null;

  @Column({ name: 'diversification_demarree', type: 'boolean', default: false })
  diversificationDemarree: boolean;

  @Column({ name: 'oedemes', type: 'boolean', default: false })
  oedemes: boolean;

  // --- Prise en charge ---
  // AUCUNE | SUPPLEMENTATION | THERAPEUTIQUE | RENVOI
  @Column({ name: 'prise_en_charge', type: 'varchar', length: 30, nullable: true })
  priseEnCharge: string | null;

  @Column({ name: 'aliment_therapeutique', type: 'varchar', length: 100, nullable: true })
  alimentTherapeutique: string | null;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
