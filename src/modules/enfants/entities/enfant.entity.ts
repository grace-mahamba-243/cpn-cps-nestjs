import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Cette entite represente le dossier administratif d un enfant.
// Elle ne contient aucune information clinique.
@Entity('enfants')
export class EnfantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, name: 'numero_fiche', unique: true })
  numeroFiche: string;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 100 })
  postnom: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  prenom: string | null;

  @Column({ type: 'char', length: 1 })
  sexe: string;

  @Column({ type: 'date', name: 'date_naissance' })
  dateNaissance: string;

  @Column({ type: 'varchar', length: 100, name: 'nom_mere' })
  nomMere: string;

  @Column({ type: 'varchar', length: 100, name: 'nom_pere', nullable: true })
  nomPere: string | null;

  @Column({ type: 'varchar', length: 30 })
  telephone: string;

  @Column({ type: 'varchar', length: 200 })
  adresse: string;

  @Column({ type: 'date', name: 'date_enregistrement' })
  dateEnregistrement: string;

  @CreateDateColumn({ name: 'cree_le' })
  creeLe: Date;

  @UpdateDateColumn({ name: 'mis_a_jour_le' })
  misAJourLe: Date;
}
