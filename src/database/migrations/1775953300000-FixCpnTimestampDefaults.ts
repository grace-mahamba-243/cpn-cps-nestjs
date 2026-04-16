import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration : ajoute DEFAULT CURRENT_TIMESTAMP aux colonnes cree_le et mis_a_jour_le des tables CPN.
export class FixCpnTimestampDefaults1775953300000 implements MigrationInterface {
  name = 'FixCpnTimestampDefaults1775953300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = ['dossiers_cpn', 'contacts_cpn', 'examens_cpn'];
    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE \`${table}\` MODIFY COLUMN \`cree_le\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
      );
      await queryRunner.query(
        `ALTER TABLE \`${table}\` MODIFY COLUMN \`mis_a_jour_le\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = ['dossiers_cpn', 'contacts_cpn', 'examens_cpn'];
    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE \`${table}\` MODIFY COLUMN \`cree_le\` datetime NOT NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE \`${table}\` MODIFY COLUMN \`mis_a_jour_le\` datetime NOT NULL`,
      );
    }
  }
}
