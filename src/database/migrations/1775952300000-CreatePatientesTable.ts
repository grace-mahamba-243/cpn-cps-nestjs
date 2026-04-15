import { MigrationInterface, QueryRunner, Table } from 'typeorm';

// Cette migration cree la table patientes pour les dossiers administratifs des meres.
export class CreatePatientesTable1775952300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'patientes',
        columns: [
          { name: 'id', type: 'char', length: '36', isPrimary: true, isNullable: false },
          { name: 'numero_dossier', type: 'varchar', length: '30', isUnique: true, isNullable: false },
          { name: 'nom', type: 'varchar', length: '100', isNullable: false },
          { name: 'postnom', type: 'varchar', length: '100', isNullable: false },
          { name: 'prenom', type: 'varchar', length: '100', isNullable: true },
          { name: 'date_naissance', type: 'date', isNullable: false },
          { name: 'age', type: 'int', default: 0, isNullable: false },
          { name: 'adresse', type: 'varchar', length: '200', isNullable: false },
          { name: 'telephone', type: 'varchar', length: '30', isNullable: false },
          { name: 'etat_matrimonial', type: 'varchar', length: '30', isNullable: false },
          { name: 'nom_partenaire', type: 'varchar', length: '100', isNullable: true },
          { name: 'occupation_femme', type: 'varchar', length: '100', isNullable: true },
          { name: 'occupation_homme', type: 'varchar', length: '100', isNullable: true },
          { name: 'personne_urgence', type: 'varchar', length: '100', isNullable: false },
          { name: 'telephone_urgence', type: 'varchar', length: '30', isNullable: false },
          { name: 'adresse_urgence', type: 'varchar', length: '200', isNullable: false },
          { name: 'date_enregistrement', type: 'date', isNullable: false },
          { name: 'cree_le', type: 'datetime', isNullable: false },
          { name: 'mis_a_jour_le', type: 'datetime', isNullable: false },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('patientes');
  }
}
