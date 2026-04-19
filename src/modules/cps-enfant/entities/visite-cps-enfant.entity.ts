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

// Cette entite represente une visite de suivi postnatal CPS pour un enfant.
@Entity('visites_cps_enfant')
export class VisiteCpsEnfantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dossier_cps_enfant_id', type: 'char', length: 36 })
  dossierCpsEnfantId: string;

  @ManyToOne(() => DossierCpsEnfantEntity, (d) => d.visites)
  @JoinColumn({ name: 'dossier_cps_enfant_id' })
  dossierCpsEnfant: DossierCpsEnfantEntity;

  // SIX_HEURES | SIX_JOURS | SIX_SEMAINES | M2 | M3 | M6 | M9 | M12 | SURPRISE
  @Column({ name: 'type_visite', type: 'varchar', length: 20 })
  typeVisite: string;

  @Column({ name: 'date_visite', type: 'date' })
  dateVisite: string;

  // Age en jours au moment de la visite
  @Column({ name: 'age_jours', type: 'int', nullable: true })
  ageJours: number | null;

  // --- Anthropométrie ---
  @Column({ name: 'poids_kg', type: 'decimal', precision: 5, scale: 3, nullable: true })
  poidsKg: number | null;

  @Column({ name: 'taille_cm', type: 'decimal', precision: 5, scale: 1, nullable: true })
  tailleCm: number | null;

  @Column({ name: 'perimetre_cranien_cm', type: 'decimal', precision: 4, scale: 1, nullable: true })
  perimetreCranienCm: number | null;

  // --- Signes vitaux ---
  @Column({ name: 'temperature_celsius', type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperatureCelsius: number | null;

  @Column({ name: 'frequence_cardiaque', type: 'int', nullable: true })
  frequenceCardiaque: number | null;

  @Column({ name: 'frequence_respiratoire', type: 'int', nullable: true })
  frequenceRespiratoire: number | null;

  // --- Examen clinique du nouveau-né ---
  // BON | PASSABLE | CRITIQUE
  @Column({ name: 'etat_general', type: 'varchar', length: 20, nullable: true })
  etatGeneral: string | null;

  // EXCLUSIF | MIXTE | ARTIFICIEL | ABSENT
  @Column({ type: 'varchar', length: 20, nullable: true })
  allaitement: string | null;

  @Column({ name: 'prise_biberon', type: 'boolean', nullable: true })
  priseBiberon: boolean | null;

  // NORMAL | PALE | ICTERIQUE | CYANIQUE
  @Column({ name: 'couleur_peau', type: 'varchar', length: 20, nullable: true })
  couleurPeau: string | null;

  @Column({ name: 'oedemes', type: 'boolean', default: false })
  oedemes: boolean;

  // OMBILICAL | IMPETIGO | AUTRE | ABSENT
  @Column({ name: 'infection_cutanee', type: 'varchar', length: 30, nullable: true })
  infectionCutanee: string | null;

  @Column({ name: 'ictere', type: 'boolean', default: false })
  ictere: boolean;

  @Column({ name: 'convulsions', type: 'boolean', default: false })
  convulsions: boolean;

  // Ombilical : NORMAL | INFECTE | DETACHE
  @Column({ name: 'etat_cordon', type: 'varchar', length: 20, nullable: true })
  etatCordon: string | null;

  // NORMAL | RETARDE | AVANCE
  @Column({ name: 'developpement_psychomoteur', type: 'varchar', length: 30, nullable: true })
  developpementPsychomoteur: string | null;

  // --- Vaccins administres lors de cette visite (liste libre) ---
  @Column({ name: 'vaccins_administres', type: 'text', nullable: true })
  vaccinsAdministres: string | null;

  // --- Décision clinique ---
  @Column({ name: 'motif', type: 'text', nullable: true })
  motif: string | null;

  @Column({ name: 'diagnostics', type: 'text', nullable: true })
  diagnostics: string | null;

  @Column({ name: 'conduite_a_tenir', type: 'text', nullable: true })
  conduiteATenir: string | null;

  @Column({ name: 'traitement_prescrit', type: 'text', nullable: true })
  traitementPrescrit: string | null;

  @Column({ name: 'prochain_rdv_date', type: 'date', nullable: true })
  prochainRdvDate: string | null;

  @Column({ name: 'prochain_type_visite', type: 'varchar', length: 20, nullable: true })
  prochainTypeVisite: string | null;

  @Column({ name: 'agent_sante', type: 'varchar', length: 100, nullable: true })
  agentSante: string | null;

  @Column({ name: 'observations', type: 'text', nullable: true })
  observations: string | null;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
