import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Cette entite represente le dossier administratif d une patiente (mere).
// Elle ne contient aucune information clinique.
@Entity('patientes')
export class PatienteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, name: 'numero_dossier', unique: true })
  numeroDossier: string;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 100 })
  postnom: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  prenom: string | null;

  @Column({ type: 'date', name: 'date_naissance' })
  dateNaissance: string;

  @Column({ type: 'int', default: 0 })
  age: number;

  @Column({ type: 'varchar', length: 200 })
  adresse: string;

  @Column({ type: 'varchar', length: 30 })
  telephone: string;

  @Column({ type: 'varchar', length: 30, name: 'etat_matrimonial' })
  etatMatrimonial: string;

  @Column({ type: 'varchar', length: 100, name: 'nom_partenaire', nullable: true })
  nomPartenaire: string | null;

  @Column({ type: 'varchar', length: 100, name: 'occupation_femme', nullable: true })
  occupationFemme: string | null;

  @Column({ type: 'varchar', length: 100, name: 'occupation_homme', nullable: true })
  occupationHomme: string | null;

  @Column({ type: 'varchar', length: 100, name: 'personne_urgence' })
  personneUrgence: string;

  @Column({ type: 'varchar', length: 30, name: 'telephone_urgence' })
  telephoneUrgence: string;

  @Column({ type: 'varchar', length: 200, name: 'adresse_urgence' })
  adresseUrgence: string;

  @Column({ type: 'date', name: 'date_enregistrement' })
  dateEnregistrement: string;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
