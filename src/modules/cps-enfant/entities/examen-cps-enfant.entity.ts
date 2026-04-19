import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DossierCpsEnfantEntity } from './dossier-cps-enfant.entity';

// Cette entite represente un examen (biologique ou echographie) demande dans le cadre du suivi postnatal enfant.
@Entity('examens_cps_enfant')
export class ExamenCpsEnfantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dossier_id', type: 'char', length: 36 })
  dossierId: string;

  @ManyToOne(() => DossierCpsEnfantEntity, { nullable: false })
  @JoinColumn({ name: 'dossier_id' })
  dossier: DossierCpsEnfantEntity;

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
