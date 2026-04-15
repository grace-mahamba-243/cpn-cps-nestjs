import { MigrationInterface, QueryRunner } from 'typeorm';

// Cette migration insere tous les roles applicatifs dans la table roles.
export class SeedAllRoles1775952800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO roles (id, code, libelle)
      VALUES
        ('11111111-1111-1111-1111-111111111111', 'ADMIN',        'Administrateur'),
        ('22222222-2222-2222-2222-222222222222', 'SUPER_ADMIN',  'Super administrateur'),
        ('33333333-3333-3333-3333-333333333333', 'MEDECIN',      'Medecin'),
        ('44444444-4444-4444-4444-444444444444', 'SAGE_FEMME',   'Sage-femme'),
        ('55555555-5555-5555-5555-555555555555', 'INFIRMIERE',   'Infirmiere'),
        ('66666666-6666-6666-6666-666666666666', 'RECEPTION',    'Reception')
      ON DUPLICATE KEY UPDATE libelle = VALUES(libelle)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM roles
      WHERE code IN ('SUPER_ADMIN', 'MEDECIN', 'SAGE_FEMME', 'INFIRMIERE', 'RECEPTION')
    `);
  }
}
