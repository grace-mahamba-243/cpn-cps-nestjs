import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PatienteEntity } from '../../patientes/entities/patiente.entity';

// Cette entite represente un evenement accouchement lie a une mere (interne ou externe).
@Entity('accouchements')
export class AccouchementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_accouchement', type: 'varchar', length: 30, unique: true })
  numeroAccouchement: string;

  @Column({ name: 'patiente_id', type: 'char', length: 36 })
  patienteId: string;

  @ManyToOne(() => PatienteEntity, { eager: true })
  @JoinColumn({ name: 'patiente_id' })
  patiente: PatienteEntity;

  // Identifiant optionnel du dossier CPN lie (null si accouchement externe sans CPN interne)
  @Column({ name: 'dossier_cpn_id', type: 'char', length: 36, nullable: true })
  dossierCpnId: string | null;

  // INTERNE = accouchement realise dans la structure ; EXTERNE = accouchement survenu ailleurs
  @Column({ name: 'type_accouchement', type: 'varchar', length: 20, default: 'INTERNE' })
  typeAccouchement: string;

  @Column({ name: 'date_accouchement', type: 'datetime' })
  dateAccouchement: string;

  @Column({ name: 'age_gestationnel', type: 'int', nullable: true })
  ageGestationnel: number | null;

  // MODE_ACCOUCHEMENT : NATUREL | CESARIENNE | INSTRUMENTAL | SIEGE | AUTRE
  @Column({ name: 'mode_accouchement', type: 'varchar', length: 30, default: 'NATUREL' })
  modeAccouchement: string;

  // ETAT_MERE : STABLE | COMPLICATION | DECES
  @Column({ name: 'etat_mere', type: 'varchar', length: 30, default: 'STABLE' })
  etatMere: string;

  @Column({ name: 'complications_mere', type: 'text', nullable: true })
  complicationsMere: string | null;

  @Column({ name: 'perte_sanguine_ml', type: 'int', nullable: true })
  perteSanguineMl: number | null;

  // --- Nouveau-né ---
  @Column({ name: 'nombre_nouveaux_nes', type: 'int', default: 1 })
  nombreNouveauxNes: number;

  // ETAT_NOUVEAU_NE : VIVANT | MORT_NE | DECES_PRECOCE
  @Column({ name: 'etat_nouveau_ne', type: 'varchar', length: 30, default: 'VIVANT' })
  etatNouveauNe: string;

  @Column({ name: 'sexe_nouveau_ne', type: 'varchar', length: 10, nullable: true })
  sexeNouveauNe: string | null;

  @Column({ name: 'poids_naissance_g', type: 'int', nullable: true })
  poidsNaissanceG: number | null;

  @Column({ name: 'score_apgar_1min', type: 'int', nullable: true })
  scoreApgar1min: number | null;

  @Column({ name: 'score_apgar_5min', type: 'int', nullable: true })
  scoreApgar5min: number | null;

  @Column({ name: 'anomalies_congenitales', type: 'text', nullable: true })
  anomaliesCongenitales: string | null;

  // --- Suivi post-partum ---
  // STATUT : EN_COURS | CPS_OUVERTE | TERMINEE
  @Column({ name: 'statut', type: 'varchar', length: 20, default: 'EN_COURS' })
  statut: string;

  @Column({ name: 'cps_femme_id', type: 'char', length: 36, nullable: true })
  cpsFemmeId: string | null;

  @Column({ name: 'dossier_enfant_id', type: 'char', length: 36, nullable: true })
  dossierEnfantId: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'enregistre_par', type: 'varchar', length: 36, nullable: true })
  enregistrePar: string | null;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  modifieLe: Date;
}
