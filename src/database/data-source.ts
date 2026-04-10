import 'reflect-metadata';
import { loadEnvFile } from 'node:process';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { RoleEntity } from '../modules/auth/entities/role.entity';
import { SessionAuthentificationEntity } from '../modules/auth/entities/session-authentification.entity';
import { UtilisateurAuthEntity } from '../modules/auth/entities/utilisateur-auth.entity';

loadEnvFile();

// Cette source TypeORM permet d'executer les migrations sans demarrer toute l'application Nest.
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'cpn_cps_himbi',
  entities: [RoleEntity, UtilisateurAuthEntity, SessionAuthentificationEntity],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false,
});