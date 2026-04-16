import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration ciblee : ajoute uniquement la contrainte unique sur le champ email des utilisateurs.
export class AjoutUniqueEmail1776289102248 implements MigrationInterface {
  name = 'AjoutUniqueEmail1776289102248';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE UNIQUE INDEX `IDX_utilisateurs_email_unique` ON `utilisateurs` (`email`)",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DROP INDEX `IDX_utilisateurs_email_unique` ON `utilisateurs`",
    );
  }
}
