import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

// Cette migration cree les tables minimales pour brancher l authentification sur MySQL.
export class CreateAuthTables1744128000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'libelle',
            type: 'varchar',
            length: '150',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'utilisateurs',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'identifiant',
            type: 'varchar',
            length: '150',
            isUnique: true,
          },
          {
            name: 'nom_affichage',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'mot_de_passe_hash',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'actif',
            type: 'boolean',
            default: true,
          },
          {
            name: 'role_id',
            type: 'char',
            length: '36',
          },
          {
            name: 'dernier_acces_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'utilisateurs',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'sessions_authentification',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'utilisateur_id',
            type: 'char',
            length: '36',
          },
          {
            name: 'jeton_session',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'expire_le',
            type: 'datetime',
          },
          {
            name: 'est_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'cree_le',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'revoquee_le',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'sessions_authentification',
      new TableForeignKey({
        columnNames: ['utilisateur_id'],
        referencedTableName: 'utilisateurs',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('sessions_authentification', true);
    await queryRunner.dropTable('utilisateurs', true);
    await queryRunner.dropTable('roles', true);
  }
}