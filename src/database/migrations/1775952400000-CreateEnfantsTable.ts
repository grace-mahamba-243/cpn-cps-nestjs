import { MigrationInterface, QueryRunner, Table } from 'typeorm';

// Cette migration cree la table enfants pour les dossiers administratifs des enfants.
export class CreateEnfantsTable1775952400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'enfants',
        columns: [
          { name: 'id', type: 'char', length: '36', isPrimary: true, isNullable: false },
          { name: 'numero_fiche', type: 'varchar', length: '30', isUnique: true, isNullable: false },
          { name: 'nom', type: 'varchar', length: '100', isNullable: false },
          { name: 'postnom', type: 'varchar', length: '100', isNullable: false },
          { name: 'prenom', type: 'varchar', length: '100', isNullable: true },
          { name: 'sexe', type: 'char', length: '1', isNullable: false },
          { name: 'date_naissance', type: 'date', isNullable: false },
          { name: 'nom_mere', type: 'varchar', length: '100', isNullable: false },
          { name: 'nom_pere', type: 'varchar', length: '100', isNullable: true },
          { name: 'telephone', type: 'varchar', length: '30', isNullable: false },
          { name: 'adresse', type: 'varchar', length: '200', isNullable: false },
          { name: 'date_enregistrement', type: 'date', isNullable: false },
          { name: 'cree_le', type: 'datetime', isNullable: false },
          { name: 'mis_a_jour_le', type: 'datetime', isNullable: false },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('enfants');
  }
}
