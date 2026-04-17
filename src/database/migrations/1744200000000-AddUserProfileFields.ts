import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Cette migration ajoute les champs de profil necessaires aux fiches detail et modification utilisateur.
export class AddUserProfileFields1744200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('utilisateurs', [
      new TableColumn({
        name: 'sexe',
        type: 'varchar',
        length: '1',
        isNullable: true,
      }),
      new TableColumn({
        name: 'date_naissance',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'telephone',
        type: 'varchar',
        length: '30',
        isNullable: true,
      }),
      new TableColumn({
        name: 'email',
        type: 'varchar',
        length: '180',
        isNullable: true,
      }),
      new TableColumn({
        name: 'adresse',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'unite',
        type: 'varchar',
        length: '150',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('utilisateurs', 'unite');
    await queryRunner.dropColumn('utilisateurs', 'adresse');
    await queryRunner.dropColumn('utilisateurs', 'email');
    await queryRunner.dropColumn('utilisateurs', 'telephone');
    await queryRunner.dropColumn('utilisateurs', 'date_naissance');
    await queryRunner.dropColumn('utilisateurs', 'sexe');
  }
}