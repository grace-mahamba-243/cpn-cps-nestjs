import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { SessionAuthentificationEntity } from './session-authentification.entity';

// Cette entite represente le compte utilisateur exploite par le module auth.
@Entity({ name: 'utilisateurs' })
export class UtilisateurAuthEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  identifiant!: string;

  @Column({ name: 'nom_affichage', type: 'varchar', length: 200 })
  nomAffichage!: string;

  @Column({ type: 'varchar', length: 1, nullable: true })
  sexe!: string | null;

  @Column({ name: 'date_naissance', type: 'date', nullable: true })
  dateNaissance!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telephone!: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true, unique: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  adresse!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  unite!: string | null;

  @Column({ name: 'mot_de_passe_hash', type: 'varchar', length: 255 })
  motDePasseHash!: string;

  @Column({ name: 'doit_changer_mot_de_passe', type: 'boolean', default: false })
  doitChangerMotDePasse!: boolean;

  @Column({ type: 'boolean', default: true })
  actif!: boolean;

  @Column({ name: 'dernier_acces_at', type: 'datetime', nullable: true })
  dernierAccesAt!: Date | null;

  @ManyToOne(() => RoleEntity, (role) => role.utilisateurs, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;

  @Column({ name: 'enregistre_par', type: 'varchar', length: 200, nullable: true })
  enregistrePar!: string | null;

  @Column({ name: 'modifie_par', type: 'varchar', length: 200, nullable: true })
  modifiePar!: string | null;

  @OneToMany(() => SessionAuthentificationEntity, (session) => session.utilisateur)
  sessions!: SessionAuthentificationEntity[];
}