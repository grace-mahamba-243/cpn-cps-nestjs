import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DossierCpsFemmeEntity } from './dossier-cps-femme.entity';

// Cette entite represente une visite postnatale CPS (6h, 6 jours, 6 semaines ou surprise).
@Entity('visites_cps_femme')
export class VisiteCpsFemmeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dossier_cps_id', type: 'char', length: 36 })
  dossierCpsId: string;

  @ManyToOne(() => DossierCpsFemmeEntity, (dossier) => dossier.visites)
  @JoinColumn({ name: 'dossier_cps_id' })
  dossierCps: DossierCpsFemmeEntity;

  // SIX_HEURES | SIX_JOURS | SIX_SEMAINES | SURPRISE
  @Column({ name: 'type_visite', type: 'varchar', length: 20 })
  typeVisite: string;

  @Column({ name: 'numero_visite', type: 'int' })
  numeroVisite: number;

  @Column({ name: 'date_visite', type: 'date' })
  dateVisite: string;

  // --- Constantes vitales ---
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  poids: number | null; // kg

  @Column({ name: 'tension_systolique', type: 'int', nullable: true })
  tensionSystolique: number | null;

  @Column({ name: 'tension_diastolique', type: 'int', nullable: true })
  tensionDiastolique: number | null;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature: number | null;

  @Column({ name: 'frequence_cardiaque', type: 'int', nullable: true })
  frequenceCardiaque: number | null;

  // --- Examen postnatal de la mere ---
  // BON | PASSABLE | CRITIQUE
  @Column({ name: 'etat_general', type: 'varchar', length: 20, nullable: true })
  etatGeneral: string | null;

  // BONNE | INCOMPLETE | ABSENTE
  @Column({ name: 'involution_uterine', type: 'varchar', length: 20, nullable: true })
  involutionUterine: string | null;

  // NORMAL | ENGORGEMENT | CREVASSES | MASTITE
  @Column({ name: 'etat_seins', type: 'varchar', length: 20, nullable: true })
  etatSeins: string | null;

  // EXCLUSIF | MIXTE | ARTIFICIEL | ABSENT
  @Column({ type: 'varchar', length: 20, nullable: true })
  allaitement: string | null;

  // BONNE_CICATRISATION | INFECTION | DEHISCENCE | NON_APPLICABLE
  @Column({ name: 'etat_plaie', type: 'varchar', length: 30, nullable: true })
  etatPlaie: string | null;

  // ABSENTS | NORMAUX | ABONDANTS
  @Column({ type: 'varchar', length: 20, nullable: true })
  saignements: string | null;

  // NORMALES | ABONDANTES | MALODORANTES | ABSENTES
  @Column({ type: 'varchar', length: 20, nullable: true })
  lochies: string | null;

  // NORMAL | BABY_BLUES | DEPRESSION_SUSPECTEE
  @Column({ name: 'etat_psychologique', type: 'varchar', length: 30, nullable: true })
  etatPsychologique: string | null;

  @Column({ type: 'boolean', nullable: true })
  oedemes: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  paleur: boolean | null;

  @Column({ name: 'perimetre_brachial', type: 'decimal', precision: 4, scale: 1, nullable: true })
  perimetreBrachial: number | null;

  // --- Contraception ---
  @Column({ name: 'contraception_discutee', type: 'boolean', default: false })
  contraceptionDiscutee: boolean;

  @Column({ name: 'methode_contraceptive', type: 'varchar', length: 100, nullable: true })
  methodeContraceptive: string | null;

  // --- Conduite a tenir ---
  @Column({ name: 'conduite_a_tenir', type: 'text', nullable: true })
  conduiteATenir: string | null;

  @Column({ name: 'traitement_prescrit', type: 'text', nullable: true })
  traitementPrescrit: string | null;

  @Column({ name: 'prochain_rdv_date', type: 'date', nullable: true })
  prochainRdvDate: string | null;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
