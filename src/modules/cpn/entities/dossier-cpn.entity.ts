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
import { ContactCpnEntity } from './contact-cpn.entity';
import { ExamenCpnEntity } from './examen-cpn.entity';

// Cette entite represente le dossier CPN d une patiente (fiche initiale et antecedents).
@Entity('dossiers_cpn')
export class DossierCpnEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patiente_id', type: 'char', length: 36 })
  patienteId: string;

  @ManyToOne(() => PatienteEntity, { eager: true })
  @JoinColumn({ name: 'patiente_id' })
  patiente: PatienteEntity;

  @Column({ name: 'numero_dossier_cpn', type: 'varchar', length: 30, unique: true })
  numeroDossierCpn: string;

  @Column({ name: 'date_ouverture', type: 'date' })
  dateOuverture: string;

  @Column({ type: 'varchar', length: 20, default: 'OUVERT' })
  statut: string; // OUVERT | CLOS

  // --- Données obstétricales ---
  @Column({ type: 'int', default: 0 })
  gestite: number;

  @Column({ type: 'int', default: 0 })
  parite: number;

  @Column({ name: 'nombre_avortements', type: 'int', default: 0 })
  nombreAvortements: number;

  @Column({ name: 'derniers_regles', type: 'date', nullable: true })
  derniersRegles: string | null;

  @Column({ name: 'date_probable_accouchement', type: 'date', nullable: true })
  dateProbableAccouchement: string | null;

  @Column({ name: 'age_gestationnel_ouverture', type: 'int', nullable: true })
  ageGestionnelOuverture: number | null;

  // --- Antécédents ---
  @Column({ name: 'antecedents_medicaux', type: 'text', nullable: true })
  antecedentsMedicaux: string | null;

  @Column({ name: 'antecedents_chirurgicaux', type: 'text', nullable: true })
  antecedentsChirurgicaux: string | null;

  @Column({ name: 'antecedents_gynecologiques', type: 'text', nullable: true })
  antecedentsGynecologiques: string | null;

  @Column({ name: 'antecedents_obstetricaux', type: 'text', nullable: true })
  antecedentsObstetricaux: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  allergies: string | null;

  // --- Bilan biologique ---
  @Column({ name: 'groupe_sanguin', type: 'varchar', length: 5, nullable: true })
  groupeSanguin: string | null; // A | B | AB | O

  @Column({ type: 'varchar', length: 5, nullable: true })
  rhesus: string | null; // + | -

  @Column({ name: 'vih_statut', type: 'varchar', length: 20, default: 'INCONNU' })
  vihStatut: string; // POSITIF | NEGATIF | INCONNU

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => ContactCpnEntity, (contact) => contact.dossierCpn)
  contacts: ContactCpnEntity[];

  @OneToMany(() => ExamenCpnEntity, (examen) => examen.dossierCpn)
  examens: ExamenCpnEntity[];

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
