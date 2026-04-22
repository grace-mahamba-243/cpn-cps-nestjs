import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration : module dossier enfant complet (enfants, suivis, nutritions, vaccinations)
export class CreateDossierEnfantTables1777000000000 implements MigrationInterface {
  name = 'CreateDossierEnfantTables1777000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Modification de la table enfants existante pour ajouter les nouveaux champs
    await queryRunner.query(`
      ALTER TABLE \`enfants\`
        ADD COLUMN IF NOT EXISTS \`numero_dossier\` varchar(30) NULL,
        ADD COLUMN IF NOT EXISTS \`patiente_id\` char(36) NULL,
        ADD COLUMN IF NOT EXISTS \`lieu_naissance\` varchar(20) NOT NULL DEFAULT 'INTERNE',
        ADD COLUMN IF NOT EXISTS \`poids_naissance_g\` int NULL,
        ADD COLUMN IF NOT EXISTS \`score_apgar_1min\` int NULL,
        ADD COLUMN IF NOT EXISTS \`score_apgar_5min\` int NULL,
        ADD COLUMN IF NOT EXISTS \`etat_naissance\` varchar(20) NOT NULL DEFAULT 'VIVANT',
        ADD COLUMN IF NOT EXISTS \`age_gestationnel_semaines\` int NULL,
        ADD COLUMN IF NOT EXISTS \`statut\` varchar(10) NOT NULL DEFAULT 'OUVERT'
    `);

    // Renommer numero_fiche en numero_dossier si la colonne ancienne existe
    await queryRunner.query(`
      UPDATE \`enfants\` SET \`numero_dossier\` = \`numero_fiche\` WHERE \`numero_dossier\` IS NULL
    `).catch(() => { /* numero_fiche n existe pas, on ignore */ });

    // 2. Table des suivis cliniques enfant
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`suivis_enfants\` (
        \`id\`                        char(36)        NOT NULL,
        \`enfant_id\`                 char(36)        NOT NULL,
        \`date_visite\`               date            NOT NULL,
        \`age_mois\`                  int             NULL,
        \`poids_kg\`                  decimal(5,3)    NULL,
        \`taille_cm\`                 decimal(5,1)    NULL,
        \`perimetre_cranien_cm\`      decimal(4,1)    NULL,
        \`perimetre_brachial_cm\`     decimal(4,1)    NULL,
        \`temperature_celsius\`       decimal(4,1)    NULL,
        \`frequence_cardiaque\`       int             NULL,
        \`frequence_respiratoire\`    int             NULL,
        \`etat_general\`              varchar(20)     NULL,
        \`couleur_peau\`              varchar(20)     NULL,
        \`oedemes\`                   tinyint(1)      NOT NULL DEFAULT 0,
        \`deshydratation\`            tinyint(1)      NOT NULL DEFAULT 0,
        \`developpement_psychomoteur\` varchar(30)    NULL,
        \`allaitement\`               varchar(20)     NULL,
        \`motif\`                     text            NULL,
        \`diagnostics\`               text            NULL,
        \`conduite_a_tenir\`          text            NULL,
        \`traitement_prescrit\`       text            NULL,
        \`prochain_rdv_date\`         date            NULL,
        \`observations\`              text            NULL,
        \`cree_le\`                   datetime(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`mis_a_jour_le\`             datetime(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_suivis_enfants_enfant\` FOREIGN KEY (\`enfant_id\`) REFERENCES \`enfants\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. Table des evaluations nutritionnelles enfant
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`nutritions_enfants\` (
        \`id\`                        char(36)        NOT NULL,
        \`enfant_id\`                 char(36)        NOT NULL,
        \`date_evaluation\`           date            NOT NULL,
        \`age_mois\`                  int             NULL,
        \`poids_kg\`                  decimal(5,3)    NULL,
        \`taille_cm\`                 decimal(5,1)    NULL,
        \`perimetre_brachial_cm\`     decimal(4,1)    NULL,
        \`statut_nutritionnel\`       varchar(20)     NULL,
        \`z_score_poids_age\`         decimal(5,2)    NULL,
        \`z_score_taille_age\`        decimal(5,2)    NULL,
        \`z_score_poids_taille\`      decimal(5,2)    NULL,
        \`type_alimentation\`         varchar(20)     NULL,
        \`diversification_demarree\`  tinyint(1)      NOT NULL DEFAULT 0,
        \`oedemes\`                   tinyint(1)      NOT NULL DEFAULT 0,
        \`prise_en_charge\`           varchar(30)     NULL,
        \`aliment_therapeutique\`     varchar(100)    NULL,
        \`observations\`              text            NULL,
        \`cree_le\`                   datetime(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`mis_a_jour_le\`             datetime(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_nutritions_enfants_enfant\` FOREIGN KEY (\`enfant_id\`) REFERENCES \`enfants\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. Table des doses de vaccination enfant
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`vaccinations_doses\` (
        \`id\`                    char(36)        NOT NULL,
        \`enfant_id\`             char(36)        NOT NULL,
        \`vaccin\`                varchar(50)     NOT NULL,
        \`numero_dose\`           int             NOT NULL DEFAULT 1,
        \`date_administration\`   date            NOT NULL,
        \`age_mois\`              int             NULL,
        \`numero_lot\`            varchar(50)     NULL,
        \`statut\`                varchar(20)     NOT NULL DEFAULT 'ADMINISTREE',
        \`motif_report\`          text            NULL,
        \`prochaine_dose_date\`   date            NULL,
        \`observations\`          text            NULL,
        \`cree_le\`               datetime(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`mis_a_jour_le\`         datetime(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_vaccinations_doses_enfant\` FOREIGN KEY (\`enfant_id\`) REFERENCES \`enfants\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`vaccinations_doses\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`nutritions_enfants\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`suivis_enfants\``);
    await queryRunner.query(`
      ALTER TABLE \`enfants\`
        DROP COLUMN IF EXISTS \`statut\`,
        DROP COLUMN IF EXISTS \`age_gestationnel_semaines\`,
        DROP COLUMN IF EXISTS \`etat_naissance\`,
        DROP COLUMN IF EXISTS \`score_apgar_5min\`,
        DROP COLUMN IF EXISTS \`score_apgar_1min\`,
        DROP COLUMN IF EXISTS \`poids_naissance_g\`,
        DROP COLUMN IF EXISTS \`lieu_naissance\`,
        DROP COLUMN IF EXISTS \`patiente_id\`,
        DROP COLUMN IF EXISTS \`numero_dossier\`
    `);
  }
}
