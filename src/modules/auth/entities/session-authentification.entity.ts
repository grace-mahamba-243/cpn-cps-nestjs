import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UtilisateurAuthEntity } from './utilisateur-auth.entity';

// Cette entite represente les sessions ouvertes par les utilisateurs authentifies.
@Entity({ name: 'sessions_authentification' })
export class SessionAuthentificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UtilisateurAuthEntity, (utilisateur) => utilisateur.sessions, {
    nullable: false,
  })
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur!: UtilisateurAuthEntity;

  @Column({ name: 'jeton_session', type: 'varchar', length: 255, unique: true })
  jetonSession!: string;

  @Column({ name: 'expire_le', type: 'datetime' })
  expireLe!: Date;

  @Column({ name: 'est_active', type: 'boolean', default: true })
  estActive!: boolean;

  @CreateDateColumn({ name: 'cree_le', type: 'datetime' })
  creeLe!: Date;

  @Column({ name: 'revoquee_le', type: 'datetime', nullable: true })
  revoqueeLe!: Date | null;
}