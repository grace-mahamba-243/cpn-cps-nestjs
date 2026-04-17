import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Cette migration ajoute la colonne type_patient a la table rendez_vous.
// Permet d identifier si le rendez-vous concerne une mere ou un enfant.
export class AddTypePatientRendezVous1775952200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'rendez_vous',
      new TableColumn({
        name: 'type_patient',
        type: 'varchar',
        length: '10',
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('rendez_vous', 'type_patient');
  }
}
