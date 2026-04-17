import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

// Ajoute les colonnes facteurs_risque et taille a la table dossiers_cpn.
export class AddFacteursRisqueTailleToDossiersCpn1775953100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('dossiers_cpn', [
      new TableColumn({
        name: 'facteurs_risque',
        type: 'text',
        isNullable: true,
        default: null,
      }),
      new TableColumn({
        name: 'taille',
        type: 'decimal',
        precision: 5,
        scale: 1,
        isNullable: true,
        default: null,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('dossiers_cpn', 'taille');
    await queryRunner.dropColumn('dossiers_cpn', 'facteurs_risque');
  }
}
