import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration qui supprime la notion de rendez-vous surprise.
// Les anciens enregistrements de type SURPRISE sont convertis en ARRIVE (ils etaient deja arrives).
export class MigrateRendezVousSurprise1775953400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Les RDVs avec statut SURPRISE passent à ARRIVE (le patient était déjà présent)
    await queryRunner.query(
      `UPDATE rendez_vous SET statut = 'ARRIVE', mis_a_jour_le = NOW() WHERE statut = 'SURPRISE'`,
    );
    // Tous les typeRdv SURPRISE passent à PROGRAMME (un seul type désormais)
    await queryRunner.query(
      `UPDATE rendez_vous SET type_rdv = 'PROGRAMME', mis_a_jour_le = NOW() WHERE type_rdv = 'SURPRISE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Irreversible : on ne peut pas distinguer les anciens surprises des vrais arrivés
  }
}
