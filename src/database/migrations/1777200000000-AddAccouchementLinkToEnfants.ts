import { MigrationInterface, QueryRunner } from 'typeorm';

// Ajoute le lien accouchement/index nouveau-ne au dossier enfant pour prevenir les doublons CPS.
export class AddAccouchementLinkToEnfants1777200000000 implements MigrationInterface {
  name = 'AddAccouchementLinkToEnfants1777200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const colonneAccouchement = await queryRunner.query(`
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'enfants'
        AND COLUMN_NAME = 'accouchement_id'
      LIMIT 1
    `);
    if (!colonneAccouchement.length) {
      await queryRunner.query("ALTER TABLE `enfants` ADD COLUMN `accouchement_id` char(36) NULL");
    }

    const colonneIndex = await queryRunner.query(`
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'enfants'
        AND COLUMN_NAME = 'index_nouveau_ne'
      LIMIT 1
    `);
    if (!colonneIndex.length) {
      await queryRunner.query('ALTER TABLE `enfants` ADD COLUMN `index_nouveau_ne` int NULL');
    }

    await queryRunner.query(`
      CREATE UNIQUE INDEX \`UX_enfants_accouchement_index_nouveau_ne\`
      ON \`enfants\` (\`accouchement_id\`, \`index_nouveau_ne\`)
    `).catch(() => {
      /* index deja present */
    });
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX \`UX_enfants_accouchement_index_nouveau_ne\` ON \`enfants\`').catch(() => {
      /* index absent */
    });

    const colonneIndex = await queryRunner.query(`
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'enfants'
        AND COLUMN_NAME = 'index_nouveau_ne'
      LIMIT 1
    `);
    if (colonneIndex.length) {
      await queryRunner.query('ALTER TABLE `enfants` DROP COLUMN `index_nouveau_ne`');
    }

    const colonneAccouchement = await queryRunner.query(`
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'enfants'
        AND COLUMN_NAME = 'accouchement_id'
      LIMIT 1
    `);
    if (colonneAccouchement.length) {
      await queryRunner.query('ALTER TABLE `enfants` DROP COLUMN `accouchement_id`');
    }
  }
}
