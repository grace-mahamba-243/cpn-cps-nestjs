import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DossierCpnEntity } from './dossier-cpn.entity';
import { ContactCpnEntity } from './contact-cpn.entity';

// Cette entite represente un examen demande ou recu dans le cadre du suivi CPN.
@Entity('examens_cpn')
export class ExamenCpnEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dossier_cpn_id', type: 'char', length: 36 })
  dossierCpnId: string;

  @ManyToOne(() => DossierCpnEntity, (dossier) => dossier.examens)
  @JoinColumn({ name: 'dossier_cpn_id' })
  dossierCpn: DossierCpnEntity;

  @Column({ name: 'contact_cpn_id', type: 'char', length: 36, nullable: true })
  contactCpnId: string | null;

  @ManyToOne(() => ContactCpnEntity, (contact) => contact.examens, { nullable: true })
  @JoinColumn({ name: 'contact_cpn_id' })
  contactCpn: ContactCpnEntity | null;

  @Column({ name: 'type_examen', type: 'varchar', length: 30 })
  typeExamen: string; // BIOLOGIQUE | ECHOGRAPHIE | AUTRE

  @Column({ type: 'varchar', length: 200 })
  libelle: string;

  @Column({ type: 'varchar', length: 20, default: 'DEMANDE' })
  statut: string; // DEMANDE | RESULTAT_RECU

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

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
