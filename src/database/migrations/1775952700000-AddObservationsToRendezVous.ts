import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration : ajout des colonnes observations et cree_par dans la table rendez_vous.
// Ces colonnes permettent de stocker les notes complementaires et l auteur de la creation.
export class AddObservationsToRendezVous1775952700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE rendez_vous ADD COLUMN observations TEXT NULL`);
    await queryRunner.query(`ALTER TABLE rendez_vous ADD COLUMN cree_par VARCHAR(200) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE rendez_vous DROP COLUMN observations`);
    await queryRunner.query(`ALTER TABLE rendez_vous DROP COLUMN cree_par`);
  }
}
