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
import { EnfantEntity } from '../../enfants/entities/enfant.entity';
import { VisiteCpsEnfantEntity } from './visite-cps-enfant.entity';

// Ce dossier regroupe le suivi postnatal CPS d un enfant de la naissance a 59 mois.
@Entity('dossiers_cps_enfant')
export class DossierCpsEnfantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_dossier_cps', type: 'varchar', length: 30, unique: true })
  numeroDossierCps: string;

  @Column({ name: 'enfant_id', type: 'char', length: 36 })
  enfantId: string;

  @ManyToOne(() => EnfantEntity, { eager: true })
  @JoinColumn({ name: 'enfant_id' })
  enfant: EnfantEntity;

  // Lien vers la mere si connue (via le dossier administratif enfant)
  @Column({ name: 'mere_nom', type: 'varchar', length: 200, nullable: true })
  mereNom: string | null;

  @Column({ name: 'mere_telephone', type: 'varchar', length: 30, nullable: true })
  mereTelephone: string | null;

  @Column({ name: 'date_ouverture', type: 'date' })
  dateOuverture: string;

  // Date de naissance de l enfant (copie depuis enfant pour acces rapide)
  @Column({ name: 'date_naissance', type: 'date' })
  dateNaissance: string;

  // INTERNE = accouchement realise dans la structure ; EXTERNE = ne ailleurs
  @Column({ name: 'type_accouchement', type: 'varchar', length: 20, default: 'INTERNE' })
  typeAccouchement: string;

  @Column({ name: 'poids_naissance_g', type: 'int', nullable: true })
  poidsNaissanceG: number | null;

  @Column({ name: 'score_apgar_1min', type: 'int', nullable: true })
  scoreApgar1min: number | null;

  @Column({ name: 'score_apgar_5min', type: 'int', nullable: true })
  scoreApgar5min: number | null;

  @Column({ name: 'groupe_sanguin', type: 'varchar', length: 5, nullable: true })
  groupeSanguin: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  rhesus: string | null;

  // VIH statut : NEGATIF | POSITIF | INCONNU | EXPOSE
  @Column({ name: 'vih_statut', type: 'varchar', length: 20, default: 'INCONNU' })
  vihStatut: string;

  // OUVERT | CLOS
  @Column({ type: 'varchar', length: 10, default: 'OUVERT' })
  statut: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => VisiteCpsEnfantEntity, (v) => v.dossierCpsEnfant, { cascade: true })
  visites: VisiteCpsEnfantEntity[];

  @Column({ name: 'enregistre_par', type: 'varchar', length: 200, nullable: true })
  enregistrePar: string | null;

  @Column({ name: 'modifie_par', type: 'varchar', length: 200, nullable: true })
  modifiePar: string | null;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
