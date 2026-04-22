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

// Cette entite represente une dose de vaccin administree a un enfant.
@Entity('vaccinations_doses')
export class VaccinationDoseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'enfant_id', type: 'char', length: 36 })
  enfantId: string;

  @ManyToOne(() => EnfantEntity, (e) => e.doses)
  @JoinColumn({ name: 'enfant_id' })
  enfant: EnfantEntity;

  // Nom du vaccin : BCG, PENTA1, PENTA2, PENTA3, VAR, VAA, etc.
  @Column({ name: 'vaccin', type: 'varchar', length: 50 })
  vaccin: string;

  // Numero de dose pour ce vaccin (1, 2, 3...)
  @Column({ name: 'numero_dose', type: 'int', default: 1 })
  numeroDose: number;

  @Column({ name: 'date_administration', type: 'date' })
  dateAdministration: string;

  // Age de l enfant en mois au moment de l administration
  @Column({ name: 'age_mois', type: 'int', nullable: true })
  ageMois: number | null;

  // Lot du vaccin (tracabilite)
  @Column({ name: 'numero_lot', type: 'varchar', length: 50, nullable: true })
  numeroLot: string | null;

  // ADMINISTREE | DIFFEREE | REFUSEE
  @Column({ type: 'varchar', length: 20, default: 'ADMINISTREE' })
  statut: string;

  @Column({ name: 'motif_report', type: 'text', nullable: true })
  motifReport: string | null;

  @Column({ name: 'prochaine_dose_date', type: 'date', nullable: true })
  prochaineDoseDate: string | null;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  // Nom de l'agent qui a administré le vaccin
  @Column({ name: 'administre_par', type: 'varchar', length: 150, nullable: true })
  administrePar: string | null;

  @Column({ name: 'enregistre_par', type: 'varchar', length: 200, nullable: true })
  enregistrePar: string | null;

  @Column({ name: 'modifie_par', type: 'varchar', length: 200, nullable: true })
  modifiePar: string | null;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
