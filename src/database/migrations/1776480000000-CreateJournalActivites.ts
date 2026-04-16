import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration : creer la table journal_activites pour l'historique des actions utilisateurs
export class CreateJournalActivites1776480000000 implements MigrationInterface {
  name = 'CreateJournalActivites1776480000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`journal_activites\` (
        \`id\` char(36) NOT NULL,
        \`utilisateur_id\` char(36) NOT NULL,
        \`utilisateur_nom\` varchar(200) NOT NULL,
        \`type_action\` varchar(30) NOT NULL,
        \`module\` varchar(50) NOT NULL,
        \`section\` varchar(50) NULL,
        \`ressource_id\` varchar(36) NULL,
        \`description\` text NOT NULL,
        \`meta\` text NULL,
        \`cree_le\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_journal_utilisateur_id\` (\`utilisateur_id\`),
        INDEX \`IDX_journal_module\` (\`module\`),
        INDEX \`IDX_journal_cree_le\` (\`cree_le\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`journal_activites\``);
  }
}
