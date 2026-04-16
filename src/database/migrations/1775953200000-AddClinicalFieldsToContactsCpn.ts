import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration : ajout des champs cliniques complementaires aux contacts CPN.
export class AddClinicalFieldsToContactsCpn1775953200000 implements MigrationInterface {
  name = 'AddClinicalFieldsToContactsCpn1775953200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` ADD \`etat_general\` varchar(20) NULL`);
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` ADD \`perimetre_brachial\` decimal(4,1) NULL`);
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` ADD \`prote_inurie\` varchar(10) NULL`);
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` ADD \`paleur\` tinyint NULL`);
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` ADD \`ecoulement_vaginal\` tinyint NULL`);
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` ADD \`ulcerations_genitales\` tinyint NULL`);
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` ADD \`etat_du_col\` text NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` DROP COLUMN \`etat_du_col\``);
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` DROP COLUMN \`ulcerations_genitales\``);
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` DROP COLUMN \`ecoulement_vaginal\``);
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` DROP COLUMN \`paleur\``);
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` DROP COLUMN \`prote_inurie\``);
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` DROP COLUMN \`perimetre_brachial\``);
    await queryRunner.query(`ALTER TABLE \`contacts_cpn\` DROP COLUMN \`etat_general\``);
  }
}
