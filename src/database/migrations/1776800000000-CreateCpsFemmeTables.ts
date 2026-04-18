import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

// Cette migration cree les tables du module CPS Femme (dossier postnatal + visites).
export class CreateCpsFemmeTables1776800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Table dossiers_cps_femme ---
    await queryRunner.createTable(
      new Table({
        name: 'dossiers_cps_femme',
        columns: [
          { name: 'id', type: 'char', length: '36', isPrimary: true, isNullable: false },
          { name: 'numero_dossier_cps', type: 'varchar', length: '30', isUnique: true, isNullable: false },
          { name: 'patiente_id', type: 'char', length: '36', isNullable: false },
          { name: 'accouchement_id', type: 'char', length: '36', isNullable: true },
          { name: 'dossier_cpn_id', type: 'char', length: '36', isNullable: true },
          { name: 'type_accouchement_entree', type: 'varchar', length: '20', default: "'INTERNE'", isNullable: false },
          { name: 'date_ouverture', type: 'date', isNullable: false },
          { name: 'date_accouchement', type: 'date', isNullable: false },
          { name: 'mode_accouchement', type: 'varchar', length: '30', default: "'NATUREL'", isNullable: false },
          { name: 'etat_mere_entree', type: 'varchar', length: '30', default: "'STABLE'", isNullable: false },
          { name: 'complications_accouchement', type: 'text', isNullable: true },
          { name: 'nombre_nouveaux_nes', type: 'int', default: '1', isNullable: false },
          { name: 'etat_nouveau_ne', type: 'varchar', length: '30', default: "'VIVANT'", isNullable: false },
          { name: 'sexe_nouveau_ne', type: 'varchar', length: '10', isNullable: true },
          { name: 'poids_naissance_g', type: 'int', isNullable: true },
          { name: 'score_apgar_1min', type: 'int', isNullable: true },
          { name: 'score_apgar_5min', type: 'int', isNullable: true },
          { name: 'gestite', type: 'int', default: '0', isNullable: false },
          { name: 'parite', type: 'int', default: '0', isNullable: false },
          { name: 'groupe_sanguin', type: 'varchar', length: '5', isNullable: true },
          { name: 'rhesus', type: 'varchar', length: '5', isNullable: true },
          { name: 'vih_statut', type: 'varchar', length: '20', default: "'INCONNU'", isNullable: false },
          { name: 'statut', type: 'varchar', length: '20', default: "'OUVERT'", isNullable: false },
          { name: 'date_cloture', type: 'date', isNullable: true },
          { name: 'clos_par', type: 'varchar', length: '100', isNullable: true },
          { name: 'notes_cloture', type: 'text', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
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
      'dossiers_cps_femme',
      new TableForeignKey({
        columnNames: ['patiente_id'],
        referencedTableName: 'patientes',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'dossiers_cps_femme',
      new TableForeignKey({
        columnNames: ['dossier_cpn_id'],
        referencedTableName: 'dossiers_cpn',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );

    // --- Table visites_cps_femme ---
    await queryRunner.createTable(
      new Table({
        name: 'visites_cps_femme',
        columns: [
          { name: 'id', type: 'char', length: '36', isPrimary: true, isNullable: false },
          { name: 'dossier_cps_id', type: 'char', length: '36', isNullable: false },
          { name: 'type_visite', type: 'varchar', length: '20', isNullable: false },
          { name: 'numero_visite', type: 'int', isNullable: false },
          { name: 'date_visite', type: 'date', isNullable: false },
          { name: 'poids', type: 'decimal', precision: 5, scale: 2, isNullable: true },
          { name: 'tension_systolique', type: 'int', isNullable: true },
          { name: 'tension_diastolique', type: 'int', isNullable: true },
          { name: 'temperature', type: 'decimal', precision: 4, scale: 1, isNullable: true },
          { name: 'frequence_cardiaque', type: 'int', isNullable: true },
          { name: 'etat_general', type: 'varchar', length: '20', isNullable: true },
          { name: 'involution_uterine', type: 'varchar', length: '20', isNullable: true },
          { name: 'etat_seins', type: 'varchar', length: '20', isNullable: true },
          { name: 'allaitement', type: 'varchar', length: '20', isNullable: true },
          { name: 'etat_plaie', type: 'varchar', length: '30', isNullable: true },
          { name: 'saignements', type: 'varchar', length: '20', isNullable: true },
          { name: 'lochies', type: 'varchar', length: '20', isNullable: true },
          { name: 'etat_psychologique', type: 'varchar', length: '30', isNullable: true },
          { name: 'oedemes', type: 'tinyint', width: 1, isNullable: true },
          { name: 'paleur', type: 'tinyint', width: 1, isNullable: true },
          { name: 'perimetre_brachial', type: 'decimal', precision: 4, scale: 1, isNullable: true },
          { name: 'contraception_discutee', type: 'tinyint', width: 1, default: '0', isNullable: false },
          { name: 'methode_contraceptive', type: 'varchar', length: '100', isNullable: true },
          { name: 'conduite_a_tenir', type: 'text', isNullable: true },
          { name: 'traitement_prescrit', type: 'text', isNullable: true },
          { name: 'prochain_rdv_date', type: 'date', isNullable: true },
          { name: 'observations', type: 'text', isNullable: true },
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
      'visites_cps_femme',
      new TableForeignKey({
        columnNames: ['dossier_cps_id'],
        referencedTableName: 'dossiers_cps_femme',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('visites_cps_femme', true, true);
    await queryRunner.dropTable('dossiers_cps_femme', true, true);
  }
}
