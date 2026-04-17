// Migration pour la creation de la table rendez_vous.
// Stocke les rendez-vous planifies (PROGRAMME) et les arrivees imprevues (SURPRISE).
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRendezVousTables1775952000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rendez_vous',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'date_rdv',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'heure_rdv',
            type: 'varchar',
            length: '5',
            isNullable: false,
          },
          {
            name: 'motif',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'statut',
            type: 'varchar',
            length: '30',
            default: "'EN_ATTENTE'",
            isNullable: false,
          },
          {
            name: 'type_rdv',
            type: 'varchar',
            length: '20',
            default: "'PROGRAMME'",
            isNullable: false,
          },
          {
            name: 'nom_patient',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'initiales_patient',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'ref_dossier',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'service_destination',
            type: 'varchar',
            length: '60',
            isNullable: true,
          },
          {
            name: 'cree_le',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'mis_a_jour_le',
            type: 'datetime',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('rendez_vous');
  }
}
