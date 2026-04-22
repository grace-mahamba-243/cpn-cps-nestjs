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
import { DossierCpnEntity } from './dossier-cpn.entity';
import { ExamenCpnEntity } from './examen-cpn.entity';

// Cette entite represente un contact de suivi prenatal (visite CPN).
@Entity('contacts_cpn')
export class ContactCpnEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dossier_cpn_id', type: 'char', length: 36 })
  dossierCpnId: string;

  @ManyToOne(() => DossierCpnEntity, (dossier) => dossier.contacts)
  @JoinColumn({ name: 'dossier_cpn_id' })
  dossierCpn: DossierCpnEntity;

  @Column({ name: 'numero_contact', type: 'int' })
  numeroContact: number;

  @Column({ name: 'date_contact', type: 'date' })
  dateContact: string;

  @Column({ name: 'age_gestationnel', type: 'int', nullable: true })
  ageGestationnel: number | null; // en semaines

  // --- Constantes vitales ---
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  poids: number | null; // kg

  @Column({ name: 'tension_systolique', type: 'int', nullable: true })
  tensionSystolique: number | null;

  @Column({ name: 'tension_diastolique', type: 'int', nullable: true })
  tensionDiastolique: number | null;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature: number | null;

  @Column({ name: 'hauteur_uterine', type: 'decimal', precision: 4, scale: 1, nullable: true })
  hauteurUterine: number | null; // cm

  @Column({ name: 'frequence_cardiaque_mere', type: 'int', nullable: true })
  frequenceCardiaqueMore: number | null;

  @Column({ type: 'int', nullable: true })
  bfc: number | null; // bruits du coeur foetal

  // --- Examen obstétrical ---
  @Column({ name: 'presentation_foetale', type: 'varchar', length: 20, nullable: true })
  presentationFoetale: string | null; // CEPHALIQUE | PODALIQUE | TRANSVERSE

  @Column({ name: 'mouvements_actifs', type: 'boolean', nullable: true })
  mouvementsActifs: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  oedemes: boolean | null;

  @Column({ type: 'boolean', nullable: true })
  varices: boolean | null;

  @Column({ name: 'etat_general', type: 'varchar', length: 20, nullable: true })
  etatGeneral: string | null; // BON | PASSABLE | CRITIQUE

  @Column({ name: 'perimetre_brachial', type: 'decimal', precision: 4, scale: 1, nullable: true })
  perimetreBrachial: number | null; // cm

  @Column({ name: 'prote_inurie', type: 'varchar', length: 10, nullable: true })
  proteInurie: string | null; // NEGATIF | TRACES | 1+ | 2+ | 3+

  @Column({ type: 'boolean', nullable: true })
  paleur: boolean | null;

  @Column({ name: 'ecoulement_vaginal', type: 'boolean', nullable: true })
  ecoulementVaginal: boolean | null;

  @Column({ name: 'ulcerations_genitales', type: 'boolean', nullable: true })
  ulcerationsGenitales: boolean | null;

  @Column({ name: 'etat_du_col', type: 'text', nullable: true })
  etatDuCol: string | null;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  @Column({ name: 'traitement_prescrit', type: 'text', nullable: true })
  traitementPrescrit: string | null;

  // --- Prochain rendez-vous ---
  @Column({ name: 'prochain_rdv_date', type: 'date', nullable: true })
  prochainRdvDate: string | null;

  @Column({ name: 'prochain_rdv_notes', type: 'varchar', length: 300, nullable: true })
  prochainRdvNotes: string | null;

  @OneToMany(() => ExamenCpnEntity, (examen) => examen.contactCpn)
  examens: ExamenCpnEntity[];

  @Column({ name: 'enregistre_par', type: 'varchar', length: 200, nullable: true })
  enregistrePar: string | null;

  @Column({ name: 'modifie_par', type: 'varchar', length: 200, nullable: true })
  modifiePar: string | null;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
