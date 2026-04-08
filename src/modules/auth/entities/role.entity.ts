import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UtilisateurAuthEntity } from './utilisateur-auth.entity';

// Cette entite represente les roles relies aux comptes autorises dans l'application.
@Entity({ name: 'roles' })
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 150 })
  libelle!: string;

  @OneToMany(() => UtilisateurAuthEntity, (utilisateur) => utilisateur.role)
  utilisateurs!: UtilisateurAuthEntity[];
}