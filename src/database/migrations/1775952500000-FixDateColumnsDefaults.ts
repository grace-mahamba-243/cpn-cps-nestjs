import { MigrationInterface, QueryRunner } from 'typeorm';

// Cette migration corrige les colonnes cree_le et mis_a_jour_le qui manquaient
// de valeur par defaut (DEFAULT CURRENT_TIMESTAMP) dans les tables patientes, enfants et rendez_vous.
export class FixDateColumnsDefaults1775952500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`patientes\`
        MODIFY COLUMN \`cree_le\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        MODIFY COLUMN \`mis_a_jour_le\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE \`enfants\`
        MODIFY COLUMN \`cree_le\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        MODIFY COLUMN \`mis_a_jour_le\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE \`rendez_vous\`
        MODIFY COLUMN \`cree_le\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        MODIFY COLUMN \`mis_a_jour_le\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`patientes\`
        MODIFY COLUMN \`cree_le\` DATETIME NOT NULL,
        MODIFY COLUMN \`mis_a_jour_le\` DATETIME NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`enfants\`
        MODIFY COLUMN \`cree_le\` DATETIME NOT NULL,
        MODIFY COLUMN \`mis_a_jour_le\` DATETIME NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`rendez_vous\`
        MODIFY COLUMN \`cree_le\` DATETIME NOT NULL,
        MODIFY COLUMN \`mis_a_jour_le\` DATETIME NOT NULL
    `);
  }
}
