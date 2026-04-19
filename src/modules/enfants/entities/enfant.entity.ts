import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PatienteEntity } from '../../patientes/entities/patiente.entity';
import { SuiviEnfantEntity } from '../../suivi-enfant/entities/suivi-enfant.entity';
import { NutritionEnfantEntity } from '../../nutrition/entities/nutrition-enfant.entity';
import { VaccinationDoseEntity } from '../../vaccination/entities/vaccination-dose.entity';

// Cette entite represente le dossier enfant central : identite, naissance et liens vers les sous-modules.
@Entity('enfants')
export class EnfantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, name: 'numero_dossier', unique: true })
  numeroDossier: string;

  // --- Identite ---
  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 100 })
  postnom: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  prenom: string | null;

  @Column({ type: 'char', length: 1 })
  sexe: string;

  @Column({ type: 'date', name: 'date_naissance' })
  dateNaissance: string;

  // --- Lien mere (optionnel) ---
  @Column({ name: 'patiente_id', type: 'char', length: 36, nullable: true })
  patienteId: string | null;

  @ManyToOne(() => PatienteEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'patiente_id' })
  patiente: PatienteEntity | null;

  // --- Informations de naissance ---
  // INTERNE = accouchement realise dans la structure ; EXTERNE = accouchement survenu ailleurs
  @Column({ name: 'lieu_naissance', type: 'varchar', length: 20, default: 'INTERNE' })
  lieuNaissance: string; // INTERNE | EXTERNE

  @Column({ name: 'poids_naissance_g', type: 'int', nullable: true })
  poidsNaissanceG: number | null;

  @Column({ name: 'score_apgar_1min', type: 'int', nullable: true })
  scoreApgar1min: number | null;

  @Column({ name: 'score_apgar_5min', type: 'int', nullable: true })
  scoreApgar5min: number | null;

  // VIVANT | MORT_NE | DECES_PRECOCE
  @Column({ name: 'etat_naissance', type: 'varchar', length: 20, default: 'VIVANT' })
  etatNaissance: string;

  @Column({ name: 'age_gestationnel_semaines', type: 'int', nullable: true })
  ageGestationnelSemaines: number | null;

  // --- Informations administratives ---
  @Column({ name: 'nom_mere', type: 'varchar', length: 100 })
  nomMere: string;

  @Column({ name: 'nom_pere', type: 'varchar', length: 100, nullable: true })
  nomPere: string | null;

  @Column({ type: 'varchar', length: 30 })
  telephone: string;

  @Column({ type: 'varchar', length: 200 })
  adresse: string;

  @Column({ name: 'date_enregistrement', type: 'date' })
  dateEnregistrement: string;

  // OUVERT | CLOS
  @Column({ type: 'varchar', length: 10, default: 'OUVERT' })
  statut: string;

  // --- Relations ---
  @OneToMany(() => SuiviEnfantEntity, (s) => s.enfant)
  suivis: SuiviEnfantEntity[];

  @OneToMany(() => NutritionEnfantEntity, (n) => n.enfant)
  nutritions: NutritionEnfantEntity[];

  @OneToMany(() => VaccinationDoseEntity, (v) => v.enfant)
  doses: VaccinationDoseEntity[];

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
