import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

// Cette migration cree les tables dossiers_cpn, contacts_cpn et examens_cpn.
export class CreateCpnTables1775953000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Table dossiers_cpn
    await queryRunner.createTable(
      new Table({
        name: 'dossiers_cpn',
        columns: [
          { name: 'id', type: 'char', length: '36', isPrimary: true, isNullable: false },
          { name: 'patiente_id', type: 'char', length: '36', isNullable: false },
          { name: 'numero_dossier_cpn', type: 'varchar', length: '30', isUnique: true, isNullable: false },
          { name: 'date_ouverture', type: 'date', isNullable: false },
          { name: 'statut', type: 'varchar', length: '20', default: "'OUVERT'", isNullable: false },
          { name: 'gestite', type: 'int', default: '0', isNullable: false },
          { name: 'parite', type: 'int', default: '0', isNullable: false },
          { name: 'nombre_avortements', type: 'int', default: '0', isNullable: false },
          { name: 'derniers_regles', type: 'date', isNullable: true },
          { name: 'date_probable_accouchement', type: 'date', isNullable: true },
          { name: 'age_gestationnel_ouverture', type: 'int', isNullable: true },
          { name: 'antecedents_medicaux', type: 'text', isNullable: true },
          { name: 'antecedents_chirurgicaux', type: 'text', isNullable: true },
          { name: 'antecedents_gynecologiques', type: 'text', isNullable: true },
          { name: 'antecedents_obstetricaux', type: 'text', isNullable: true },
          { name: 'allergies', type: 'varchar', length: '200', isNullable: true },
          { name: 'groupe_sanguin', type: 'varchar', length: '5', isNullable: true },
          { name: 'rhesus', type: 'varchar', length: '5', isNullable: true },
          { name: 'vih_statut', type: 'varchar', length: '20', default: "'INCONNU'", isNullable: false },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'cree_le', type: 'datetime', isNullable: false },
          { name: 'mis_a_jour_le', type: 'datetime', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'dossiers_cpn',
      new TableForeignKey({
        columnNames: ['patiente_id'],
        referencedTableName: 'patientes',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      }),
    );

    // Table contacts_cpn
    await queryRunner.createTable(
      new Table({
        name: 'contacts_cpn',
        columns: [
          { name: 'id', type: 'char', length: '36', isPrimary: true, isNullable: false },
          { name: 'dossier_cpn_id', type: 'char', length: '36', isNullable: false },
          { name: 'numero_contact', type: 'int', isNullable: false },
          { name: 'date_contact', type: 'date', isNullable: false },
          { name: 'age_gestationnel', type: 'int', isNullable: true },
          { name: 'poids', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'tension_systolique', type: 'int', isNullable: true },
          { name: 'tension_diastolique', type: 'int', isNullable: true },
          { name: 'temperature', type: 'decimal', precision: 4, scale: 1, isNullable: true },
          { name: 'hauteur_uterine', type: 'decimal', precision: 4, scale: 1, isNullable: true },
          { name: 'frequence_cardiaque_mere', type: 'int', isNullable: true },
          { name: 'bfc', type: 'int', isNullable: true },
          { name: 'presentation_foetale', type: 'varchar', length: '20', isNullable: true },
          { name: 'mouvements_actifs', type: 'tinyint', width: 1, isNullable: true },
          { name: 'oedemes', type: 'tinyint', width: 1, isNullable: true },
          { name: 'varices', type: 'tinyint', width: 1, isNullable: true },
          { name: 'observations', type: 'text', isNullable: true },
          { name: 'traitement_prescrit', type: 'text', isNullable: true },
          { name: 'prochain_rdv_date', type: 'date', isNullable: true },
          { name: 'prochain_rdv_notes', type: 'varchar', length: '300', isNullable: true },
          { name: 'cree_le', type: 'datetime', isNullable: false },
          { name: 'mis_a_jour_le', type: 'datetime', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'contacts_cpn',
      new TableForeignKey({
        columnNames: ['dossier_cpn_id'],
        referencedTableName: 'dossiers_cpn',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );

    // Table examens_cpn
    await queryRunner.createTable(
      new Table({
        name: 'examens_cpn',
        columns: [
          { name: 'id', type: 'char', length: '36', isPrimary: true, isNullable: false },
          { name: 'dossier_cpn_id', type: 'char', length: '36', isNullable: false },
          { name: 'contact_cpn_id', type: 'char', length: '36', isNullable: true },
          { name: 'type_examen', type: 'varchar', length: '30', isNullable: false },
          { name: 'libelle', type: 'varchar', length: '200', isNullable: false },
          { name: 'statut', type: 'varchar', length: '20', default: "'DEMANDE'", isNullable: false },
          { name: 'source', type: 'varchar', length: '20', default: "'INTERNE'", isNullable: false },
          { name: 'resultat', type: 'text', isNullable: true },
          { name: 'date_examen', type: 'date', isNullable: true },
          { name: 'date_resultat', type: 'date', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'cree_le', type: 'datetime', isNullable: false },
          { name: 'mis_a_jour_le', type: 'datetime', isNullable: false },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'examens_cpn',
      new TableForeignKey({
        columnNames: ['dossier_cpn_id'],
        referencedTableName: 'dossiers_cpn',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'examens_cpn',
      new TableForeignKey({
        columnNames: ['contact_cpn_id'],
        referencedTableName: 'contacts_cpn',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('examens_cpn', true, true);
    await queryRunner.dropTable('contacts_cpn', true, true);
    await queryRunner.dropTable('dossiers_cpn', true, true);
  }
}
