import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration : creation des tables pour le module CPS Enfant.
export class CreateCpsEnfantTables1777100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS dossiers_cps_enfant (
        id              CHAR(36)     NOT NULL PRIMARY KEY,
        numero_dossier_cps VARCHAR(30) NOT NULL UNIQUE,
        enfant_id       CHAR(36)     NOT NULL,
        mere_nom        VARCHAR(200) NULL,
        mere_telephone  VARCHAR(30)  NULL,
        date_ouverture  DATE         NOT NULL,
        date_naissance  DATE         NOT NULL,
        type_accouchement VARCHAR(20) NOT NULL DEFAULT 'INTERNE',
        poids_naissance_g INT        NULL,
        score_apgar_1min  INT        NULL,
        score_apgar_5min  INT        NULL,
        groupe_sanguin  VARCHAR(5)   NULL,
        rhesus          VARCHAR(5)   NULL,
        vih_statut      VARCHAR(20)  NOT NULL DEFAULT 'INCONNU',
        statut          VARCHAR(10)  NOT NULL DEFAULT 'OUVERT',
        notes           TEXT         NULL,
        cree_le         DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        mis_a_jour_le   DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        CONSTRAINT fk_dce_enfant FOREIGN KEY (enfant_id) REFERENCES enfants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS visites_cps_enfant (
        id                      CHAR(36)     NOT NULL PRIMARY KEY,
        dossier_cps_enfant_id   CHAR(36)     NOT NULL,
        type_visite             VARCHAR(20)  NOT NULL,
        date_visite             DATE         NOT NULL,
        age_jours               INT          NULL,
        poids_kg                DECIMAL(5,3) NULL,
        taille_cm               DECIMAL(5,1) NULL,
        perimetre_cranien_cm    DECIMAL(4,1) NULL,
        temperature_celsius     DECIMAL(4,1) NULL,
        frequence_cardiaque     INT          NULL,
        frequence_respiratoire  INT          NULL,
        etat_general            VARCHAR(20)  NULL,
        allaitement             VARCHAR(20)  NULL,
        prise_biberon           TINYINT(1)   NULL,
        couleur_peau            VARCHAR(20)  NULL,
        oedemes                 TINYINT(1)   NOT NULL DEFAULT 0,
        infection_cutanee       VARCHAR(30)  NULL,
        ictere                  TINYINT(1)   NOT NULL DEFAULT 0,
        convulsions             TINYINT(1)   NOT NULL DEFAULT 0,
        etat_cordon             VARCHAR(20)  NULL,
        developpement_psychomoteur VARCHAR(30) NULL,
        vaccins_administres     TEXT         NULL,
        motif                   TEXT         NULL,
        diagnostics             TEXT         NULL,
        conduite_a_tenir        TEXT         NULL,
        traitement_prescrit     TEXT         NULL,
        prochain_rdv_date       DATE         NULL,
        prochain_type_visite    VARCHAR(20)  NULL,
        agent_sante             VARCHAR(100) NULL,
        observations            TEXT         NULL,
        cree_le                 DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        mis_a_jour_le           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        CONSTRAINT fk_vce_dossier FOREIGN KEY (dossier_cps_enfant_id) REFERENCES dossiers_cps_enfant(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS visites_cps_enfant');
    await queryRunner.query('DROP TABLE IF EXISTS dossiers_cps_enfant');
  }
}
