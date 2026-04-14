import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// Cette entite represente un rendez-vous enregistre a la reception.
// Elle couvre les rendez-vous planifies et les rendez-vous surprise (cas non planifie).
@Entity('rendez_vous')
export class RendezVousEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Date prevue du rendez-vous au format YYYY-MM-DD
  @Column({ type: 'date', name: 'date_rdv' })
  dateRdv: string;

  // Heure du rendez-vous au format HH:mm
  @Column({ type: 'varchar', length: 5, name: 'heure_rdv' })
  heureRdv: string;

  // Motif clinique ou administratif (ex: CPN 1, Vaccination, Suivi CPS)
  @Column({ type: 'varchar', length: 100 })
  motif: string;

  // Statut du rendez-vous : PROGRAMME | CONFIRME | EN_ATTENTE | ARRIVE | TERMINE | ANNULE
  @Column({ type: 'varchar', length: 30, default: 'EN_ATTENTE' })
  statut: string;

  // Type de rendez-vous : PROGRAMME (planifie) | SURPRISE (cas non planifie / urgent)
  @Column({ type: 'varchar', length: 20, name: 'type_rdv', default: 'PROGRAMME' })
  typeRdv: string;

  // Nom complet de la patiente ou de l enfant concerne
  @Column({ type: 'varchar', length: 200, name: 'nom_patient' })
  nomPatient: string;

  // Reference courte affichee en interface (ex: MK pour Mireille Kavira)
  @Column({ type: 'varchar', length: 10, name: 'initiales_patient' })
  initialesPatient: string;

  // Numero de dossier lisible (ex: #89210)
  @Column({ type: 'varchar', length: 20, name: 'ref_dossier', nullable: true })
  refDossier: string | null;

  // Service de destination apres orientation administrative
  @Column({ type: 'varchar', length: 60, name: 'service_destination', nullable: true })
  serviceDestination: string | null;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
