import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration pour ajouter les champs de clôture au dossier CPN.
export class AddClotureFieldsToDossiersCpn1776900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE dossiers_cpn
        ADD COLUMN notes_cloture TEXT NULL AFTER notes,
        ADD COLUMN clos_par VARCHAR(150) NULL AFTER notes_cloture,
        ADD COLUMN date_cloture DATE NULL AFTER clos_par
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE dossiers_cpn
        DROP COLUMN date_cloture,
        DROP COLUMN clos_par,
        DROP COLUMN notes_cloture
    `);
  }
}
