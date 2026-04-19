import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EnfantEntity } from './enfant.entity';
import { SuiviEnfantEntity } from '../../suivi-enfant/entities/suivi-enfant.entity';

// Cette entite represente un examen demande ou recu dans le cadre du suivi d'un enfant.
@Entity('examens_enfants')
export class ExamenEnfantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'enfant_id', type: 'char', length: 36 })
  enfantId: string;

  @ManyToOne(() => EnfantEntity, { nullable: false })
  @JoinColumn({ name: 'enfant_id' })
  enfant: EnfantEntity;

  @Column({ name: 'suivi_enfant_id', type: 'char', length: 36, nullable: true })
  suiviEnfantId: string | null;

  @ManyToOne(() => SuiviEnfantEntity, { nullable: true })
  @JoinColumn({ name: 'suivi_enfant_id' })
  suiviEnfant: SuiviEnfantEntity | null;

  @Column({ name: 'type_examen', type: 'varchar', length: 30 })
  typeExamen: string; // BIOLOGIQUE | ECHOGRAPHIE | AUTRE

  @Column({ type: 'varchar', length: 200 })
  libelle: string;

  @Column({ type: 'varchar', length: 20, default: 'DEMANDE' })
  statut: string; // DEMANDE | EN_COURS | RESULTAT_RECU | RESULTAT_ENVOYE

  @Column({ type: 'varchar', length: 20, default: 'INTERNE' })
  source: string; // INTERNE | EXTERNE

  @Column({ type: 'text', nullable: true })
  resultat: string | null;

  @Column({ name: 'date_examen', type: 'date', nullable: true })
  dateExamen: string | null;

  @Column({ name: 'date_resultat', type: 'date', nullable: true })
  dateResultat: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'pris_en_charge_le', type: 'datetime', nullable: true })
  prisEnChargeLe: Date | null;

  @Column({ name: 'envoye_le', type: 'datetime', nullable: true })
  envoyeLe: Date | null;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
