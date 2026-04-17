import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration ciblee : ajoute la colonne id (UUID, cle primaire) a la table sessions_authentification.
// La table avait ete creee sans cle primaire explicite.
export class AddIdToSessionsAuthentification1776380000000 implements MigrationInterface {
  name = 'AddIdToSessionsAuthentification1776380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Ajouter id comme colonne nullable d abord (pour les lignes existantes)
    await queryRunner.query(
      `ALTER TABLE \`sessions_authentification\` ADD \`id\` varchar(36) NULL`,
    );

    // 2. Peupler les UUID pour les lignes existantes
    await queryRunner.query(
      `UPDATE \`sessions_authentification\` SET \`id\` = UUID() WHERE \`id\` IS NULL`,
    );

    // 3. Rendre la colonne NOT NULL et en faire la cle primaire
    await queryRunner.query(
      `ALTER TABLE \`sessions_authentification\` MODIFY \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sessions_authentification\` ADD PRIMARY KEY (\`id\`)`,
    );

    // 4. Recreer les index sur la table
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`uq_sessions_authentification_jeton_session\` ON \`sessions_authentification\` (\`jeton_session\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx_sessions_authentification_utilisateur_id\` ON \`sessions_authentification\` (\`utilisateur_id\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`idx_sessions_authentification_utilisateur_id\` ON \`sessions_authentification\``,
    );
    await queryRunner.query(
      `DROP INDEX \`uq_sessions_authentification_jeton_session\` ON \`sessions_authentification\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sessions_authentification\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sessions_authentification\` DROP COLUMN \`id\``,
    );
  }
}
