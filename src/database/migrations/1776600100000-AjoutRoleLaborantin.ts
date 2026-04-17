import { MigrationInterface, QueryRunner } from 'typeorm';

// Cette migration insere le role LABORANTIN dans la table roles.
export class AjoutRoleLaborantin1776600100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO roles (id, code, libelle)
      VALUES ('77777777-7777-7777-7777-777777777777', 'LABORANTIN', 'Laborantin')
      ON DUPLICATE KEY UPDATE libelle = VALUES(libelle)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM roles WHERE code = 'LABORANTIN'
    `);
  }
}
