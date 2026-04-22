import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Cette migration ajoute le drapeau de changement obligatoire du mot de passe au premier acces.
export class AddFirstLoginPasswordChangeFlag1745280000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'utilisateurs',
      new TableColumn({
        name: 'doit_changer_mot_de_passe',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('utilisateurs', 'doit_changer_mot_de_passe');
  }
}