import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Cette migration ajoute les colonnes de suivi laboratoire a la table examens_cpn.
export class AjoutColonnesLaboratoire1776600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('examens_cpn', [
      new TableColumn({
        name: 'pris_en_charge_le',
        type: 'datetime',
        isNullable: true,
      }),
      new TableColumn({
        name: 'envoye_le',
        type: 'datetime',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('examens_cpn', 'envoye_le');
    await queryRunner.dropColumn('examens_cpn', 'pris_en_charge_le');
  }
}
