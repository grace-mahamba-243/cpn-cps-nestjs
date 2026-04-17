import { MigrationInterface, QueryRunner } from 'typeorm';

// Cette migration corrige les colonnes cree_le et mis_a_jour_le de la table rendez_vous
// en ajoutant la valeur par defaut DEFAULT CURRENT_TIMESTAMP.
export class FixRendezVousDateDefaults1775952550000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`rendez_vous\`
        MODIFY COLUMN \`cree_le\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        MODIFY COLUMN \`mis_a_jour_le\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`rendez_vous\`
        MODIFY COLUMN \`cree_le\` DATETIME NOT NULL,
        MODIFY COLUMN \`mis_a_jour_le\` DATETIME NOT NULL
    `);
  }
}
