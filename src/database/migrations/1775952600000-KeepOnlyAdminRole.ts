import { MigrationInterface, QueryRunner } from 'typeorm';

// Cette migration conserve uniquement le role ADMIN et reaffecte tous les utilisateurs dessus.
export class KeepOnlyAdminRole1775952600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO roles (id, code, libelle)
      VALUES ('11111111-1111-1111-1111-111111111111', 'ADMIN', 'Administrateur')
      ON DUPLICATE KEY UPDATE libelle = VALUES(libelle)
    `);

    await queryRunner.query(`
      UPDATE utilisateurs
      SET role_id = '11111111-1111-1111-1111-111111111111'
      WHERE role_id <> '11111111-1111-1111-1111-111111111111'
    `);

    await queryRunner.query(`
      DELETE FROM roles
      WHERE code <> 'ADMIN'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO roles (id, code, libelle)
      VALUES
        ('22222222-2222-2222-2222-222222222222', 'SUPERVISEUR', 'Superviseur'),
        ('33333333-3333-3333-3333-333333333333', 'AGENT_CLINIQUE', 'Agent clinique')
      ON DUPLICATE KEY UPDATE libelle = VALUES(libelle)
    `);
  }
}
