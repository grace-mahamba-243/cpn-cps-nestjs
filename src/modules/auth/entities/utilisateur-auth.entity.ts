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

  @Column({ name: 'mot_de_passe_hash', type: 'varchar', length: 255 })
  motDePasseHash!: string;

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

  @OneToMany(() => SessionAuthentificationEntity, (session) => session.utilisateur)
  sessions!: SessionAuthentificationEntity[];
}