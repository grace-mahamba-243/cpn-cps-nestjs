import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

// Cette migration cree la table accouchements pour tracer l issue de grossesse.
export class CreateAccouchementsTable1776700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'accouchements',
        columns: [
          { name: 'id', type: 'char', length: '36', isPrimary: true, isNullable: false },
          { name: 'numero_accouchement', type: 'varchar', length: '30', isUnique: true, isNullable: false },
          { name: 'patiente_id', type: 'char', length: '36', isNullable: false },
          { name: 'dossier_cpn_id', type: 'char', length: '36', isNullable: true },
          { name: 'type_accouchement', type: 'varchar', length: '20', default: "'INTERNE'", isNullable: false },
          { name: 'date_accouchement', type: 'datetime', isNullable: false },
          { name: 'age_gestationnel', type: 'int', isNullable: true },
          { name: 'mode_accouchement', type: 'varchar', length: '30', default: "'NATUREL'", isNullable: false },
          { name: 'etat_mere', type: 'varchar', length: '30', default: "'STABLE'", isNullable: false },
          { name: 'complications_mere', type: 'text', isNullable: true },
          { name: 'perte_sanguine_ml', type: 'int', isNullable: true },
          { name: 'nombre_nouveaux_nes', type: 'int', default: '1', isNullable: false },
          { name: 'etat_nouveau_ne', type: 'varchar', length: '30', default: "'VIVANT'", isNullable: false },
          { name: 'sexe_nouveau_ne', type: 'varchar', length: '10', isNullable: true },
          { name: 'poids_naissance_g', type: 'int', isNullable: true },
          { name: 'score_apgar_1min', type: 'int', isNullable: true },
          { name: 'score_apgar_5min', type: 'int', isNullable: true },
          { name: 'anomalies_congenitales', type: 'text', isNullable: true },
          { name: 'statut', type: 'varchar', length: '20', default: "'EN_COURS'", isNullable: false },
          { name: 'cps_femme_id', type: 'char', length: '36', isNullable: true },
          { name: 'dossier_enfant_id', type: 'char', length: '36', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'enregistre_par', type: 'varchar', length: '36', isNullable: true },
          {
            name: 'cree_le',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'mis_a_jour_le',
            type: 'datetime',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'accouchements',
      new TableForeignKey({
        columnNames: ['patiente_id'],
        referencedTableName: 'patientes',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'accouchements',
      new TableForeignKey({
        columnNames: ['dossier_cpn_id'],
        referencedTableName: 'dossiers_cpn',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('accouchements', true, true);
  }
}
