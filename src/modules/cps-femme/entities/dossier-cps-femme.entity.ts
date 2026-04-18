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
import { VisiteCpsFemmeEntity } from './visite-cps-femme.entity';

// Cette entite represente le dossier de suivi postnatal CPS d une mere (apres accouchement).
@Entity('dossiers_cps_femme')
export class DossierCpsFemmeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_dossier_cps', type: 'varchar', length: 30, unique: true })
  numeroDossierCps: string;

  @Column({ name: 'patiente_id', type: 'char', length: 36 })
  patienteId: string;

  @ManyToOne(() => PatienteEntity, { eager: true })
  @JoinColumn({ name: 'patiente_id' })
  patiente: PatienteEntity;

  // Lien vers l accouchement (interne ou externe), toujours renseigne
  @Column({ name: 'accouchement_id', type: 'char', length: 36, nullable: true })
  accouchementId: string | null;

  // Lien vers le dossier CPN si la mere avait un suivi prenatal dans la structure
  @Column({ name: 'dossier_cpn_id', type: 'char', length: 36, nullable: true })
  dossierCpnId: string | null;

  // INTERNE = accouchement realise dans la structure ; EXTERNE = accouchement survenu ailleurs
  @Column({ name: 'type_accouchement_entree', type: 'varchar', length: 20, default: 'INTERNE' })
  typeAccouchementEntree: string; // INTERNE | EXTERNE

  @Column({ name: 'date_ouverture', type: 'date' })
  dateOuverture: string;

  // Date reelle de l accouchement (pour les cas externes surtout)
  @Column({ name: 'date_accouchement', type: 'date' })
  dateAccouchement: string;

  // Mode accouchement : NATUREL | CESARIENNE | INSTRUMENTAL | SIEGE | AUTRE
  @Column({ name: 'mode_accouchement', type: 'varchar', length: 30, default: 'NATUREL' })
  modeAccouchement: string;

  // Etat de la mere a l entree : STABLE | COMPLICATION
  @Column({ name: 'etat_mere_entree', type: 'varchar', length: 30, default: 'STABLE' })
  etatMereEntree: string;

  @Column({ name: 'complications_accouchement', type: 'text', nullable: true })
  complicationsAccouchement: string | null;

  // Donnees du nouveau-ne
  @Column({ name: 'nombre_nouveaux_nes', type: 'int', default: 1 })
  nombreNouveauxNes: number;

  @Column({ name: 'etat_nouveau_ne', type: 'varchar', length: 30, default: 'VIVANT' })
  etatNouveauNe: string; // VIVANT | MORT_NE | DECES_PRECOCE

  @Column({ name: 'sexe_nouveau_ne', type: 'varchar', length: 10, nullable: true })
  sexeNouveauNe: string | null;

  @Column({ name: 'poids_naissance_g', type: 'int', nullable: true })
  poidsNaissanceG: number | null;

  @Column({ name: 'score_apgar_1min', type: 'int', nullable: true })
  scoreApgar1min: number | null;

  @Column({ name: 'score_apgar_5min', type: 'int', nullable: true })
  scoreApgar5min: number | null;

  // Donnees obstétricales de la mere (reprises du CPN si existant)
  @Column({ type: 'int', default: 0 })
  gestite: number;

  @Column({ type: 'int', default: 0 })
  parite: number;

  @Column({ name: 'groupe_sanguin', type: 'varchar', length: 5, nullable: true })
  groupeSanguin: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  rhesus: string | null;

  @Column({ name: 'vih_statut', type: 'varchar', length: 20, default: 'INCONNU' })
  vihStatut: string; // POSITIF | NEGATIF | INCONNU

  // OUVERT | CLOS
  @Column({ type: 'varchar', length: 20, default: 'OUVERT' })
  statut: string;

  @Column({ name: 'date_cloture', type: 'date', nullable: true })
  dateCloture: string | null;

  @Column({ name: 'clos_par', type: 'varchar', length: 100, nullable: true })
  closPar: string | null;

  @Column({ name: 'notes_cloture', type: 'text', nullable: true })
  notesCloture: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => VisiteCpsFemmeEntity, (visite) => visite.dossierCps)
  visites: VisiteCpsFemmeEntity[];

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
