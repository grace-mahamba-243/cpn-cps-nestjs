-- ============================================================
-- Script SQL complet — Base de données cpn_cps_himbi
-- Généré depuis les migrations TypeORM du projet
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. Rôles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id`      CHAR(36)     NOT NULL,
  `code`    VARCHAR(100) NOT NULL,
  `libelle` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_roles_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Utilisateurs
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id`                        CHAR(36)     NOT NULL,
  `identifiant`               VARCHAR(150) NOT NULL,
  `nom_affichage`             VARCHAR(200) NOT NULL,
  `mot_de_passe_hash`         VARCHAR(255) NOT NULL,
  `actif`                     TINYINT(1)   NOT NULL DEFAULT 1,
  `role_id`                   CHAR(36)     NOT NULL,
  `dernier_acces_at`          DATETIME     NULL,
  `sexe`                      VARCHAR(1)   NULL,
  `date_naissance`            DATE         NULL,
  `telephone`                 VARCHAR(30)  NULL,
  `email`                     VARCHAR(180) NULL,
  `adresse`                   VARCHAR(255) NULL,
  `unite`                     VARCHAR(150) NULL,
  `doit_changer_mot_de_passe` TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_utilisateurs_identifiant` (`identifiant`),
  UNIQUE KEY `UQ_utilisateurs_email`        (`email`),
  CONSTRAINT `FK_utilisateurs_role`
    FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Sessions d'authentification
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sessions_authentification` (
  `id`              VARCHAR(36)  NOT NULL,
  `utilisateur_id`  CHAR(36)     NOT NULL,
  `jeton_session`   VARCHAR(255) NOT NULL,
  `expire_le`       DATETIME     NOT NULL,
  `est_active`      TINYINT(1)   NOT NULL DEFAULT 1,
  `cree_le`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revoquee_le`     DATETIME     NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_sessions_jeton`     (`jeton_session`),
  KEY   `IDX_sessions_utilisateur`   (`utilisateur_id`),
  CONSTRAINT `FK_sessions_utilisateur`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. Patientes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `patientes` (
  `id`                   CHAR(36)     NOT NULL,
  `numero_dossier`       VARCHAR(30)  NOT NULL,
  `nom`                  VARCHAR(100) NOT NULL,
  `postnom`              VARCHAR(100) NOT NULL,
  `prenom`               VARCHAR(100) NULL,
  `date_naissance`       DATE         NOT NULL,
  `age`                  INT          NOT NULL DEFAULT 0,
  `adresse`              VARCHAR(200) NOT NULL,
  `telephone`            VARCHAR(30)  NOT NULL,
  `etat_matrimonial`     VARCHAR(30)  NOT NULL,
  `nom_partenaire`       VARCHAR(100) NULL,
  `occupation_femme`     VARCHAR(100) NULL,
  `occupation_homme`     VARCHAR(100) NULL,
  `personne_urgence`     VARCHAR(100) NOT NULL,
  `telephone_urgence`    VARCHAR(30)  NOT NULL,
  `adresse_urgence`      VARCHAR(200) NOT NULL,
  `date_enregistrement`  DATE         NOT NULL,
  `cree_le`              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_patientes_numero_dossier` (`numero_dossier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. Rendez-vous
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rendez_vous` (
  `id`                   CHAR(36)     NOT NULL,
  `date_rdv`             DATE         NOT NULL,
  `heure_rdv`            VARCHAR(5)   NOT NULL,
  `motif`                VARCHAR(100) NOT NULL,
  `statut`               VARCHAR(30)  NOT NULL DEFAULT 'EN_ATTENTE',
  `type_rdv`             VARCHAR(20)  NOT NULL DEFAULT 'PROGRAMME',
  `type_patient`         VARCHAR(10)  NULL,
  `nom_patient`          VARCHAR(200) NOT NULL,
  `initiales_patient`    VARCHAR(10)  NOT NULL,
  `ref_dossier`          VARCHAR(20)  NULL,
  `service_destination`  VARCHAR(60)  NULL,
  `observations`         TEXT         NULL,
  `cree_par`             VARCHAR(200) NULL,
  `cree_le`              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. Enfants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `enfants` (
  `id`                       CHAR(36)     NOT NULL,
  `numero_fiche`             VARCHAR(30)  NOT NULL,
  `numero_dossier`           VARCHAR(30)  NULL,
  `nom`                      VARCHAR(100) NOT NULL,
  `postnom`                  VARCHAR(100) NOT NULL,
  `prenom`                   VARCHAR(100) NULL,
  `sexe`                     CHAR(1)      NOT NULL,
  `date_naissance`           DATE         NOT NULL,
  `patiente_id`              CHAR(36)     NULL,
  `accouchement_id`          CHAR(36)     NULL,
  `index_nouveau_ne`         INT          NULL,
  `lieu_naissance`           VARCHAR(20)  NOT NULL DEFAULT 'INTERNE',
  `poids_naissance_g`        INT          NULL,
  `score_apgar_1min`         INT          NULL,
  `score_apgar_5min`         INT          NULL,
  `etat_naissance`           VARCHAR(20)  NOT NULL DEFAULT 'VIVANT',
  `age_gestationnel_semaines` INT         NULL,
  `statut`                   VARCHAR(10)  NOT NULL DEFAULT 'OUVERT',
  `nom_mere`                 VARCHAR(100) NOT NULL,
  `nom_pere`                 VARCHAR(100) NULL,
  `telephone`                VARCHAR(30)  NOT NULL,
  `adresse`                  VARCHAR(200) NOT NULL,
  `date_enregistrement`      DATE         NOT NULL,
  `enregistre_par`           VARCHAR(200) NULL,
  `cree_le`                  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le`            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_enfants_numero_fiche`    (`numero_fiche`),
  UNIQUE KEY `UQ_enfants_accouch_index`   (`accouchement_id`, `index_nouveau_ne`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. Journal des activités
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `journal_activites` (
  `id`              CHAR(36)     NOT NULL,
  `utilisateur_id`  CHAR(36)     NOT NULL,
  `utilisateur_nom` VARCHAR(200) NOT NULL,
  `type_action`     VARCHAR(30)  NOT NULL,
  `module`          VARCHAR(50)  NOT NULL,
  `section`         VARCHAR(50)  NULL,
  `ressource_id`    VARCHAR(36)  NULL,
  `description`     TEXT         NOT NULL,
  `meta`            TEXT         NULL,
  `cree_le`         DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `IDX_journal_utilisateur` (`utilisateur_id`),
  KEY `IDX_journal_module`      (`module`),
  KEY `IDX_journal_cree_le`     (`cree_le`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. Dossiers CPN
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dossiers_cpn` (
  `id`                              CHAR(36)     NOT NULL,
  `patiente_id`                     CHAR(36)     NOT NULL,
  `numero_dossier_cpn`              VARCHAR(20)  NOT NULL,
  `date_ouverture`                  DATE         NOT NULL,
  `statut`                          VARCHAR(20)  NOT NULL DEFAULT 'OUVERT',
  `gestite`                         INT          NULL,
  `parite`                          INT          NULL,
  `nombre_avortements`              INT          NULL,
  `derniers_regles`                 DATE         NULL,
  `date_probable_accouchement`      DATE         NULL,
  `age_gestationnel_ouverture`      INT          NULL,
  `taille`                          DECIMAL(5,1) NULL,
  `facteurs_risque`                 TEXT         NULL,
  `antecedents_medicaux`            TEXT         NULL,
  `antecedents_chirurgicaux`        TEXT         NULL,
  `antecedents_gynecologiques`      TEXT         NULL,
  `antecedents_obstetricaux`        TEXT         NULL,
  `allergies`                       TEXT         NULL,
  `groupe_sanguin`                  VARCHAR(5)   NULL,
  `rhesus`                          VARCHAR(5)   NULL,
  `vih_statut`                      VARCHAR(20)  NOT NULL DEFAULT 'INCONNU',
  `notes`                           TEXT         NULL,
  `notes_cloture`                   TEXT         NULL,
  `clos_par`                        VARCHAR(150) NULL,
  `date_cloture`                    DATE         NULL,
  `cree_le`                         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le`                   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_dossiers_cpn_numero` (`numero_dossier_cpn`),
  CONSTRAINT `FK_dossiers_cpn_patiente`
    FOREIGN KEY (`patiente_id`) REFERENCES `patientes` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. Contacts CPN
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contacts_cpn` (
  `id`                    CHAR(36)     NOT NULL,
  `dossier_cpn_id`        CHAR(36)     NOT NULL,
  `numero_contact`        INT          NOT NULL,
  `date_contact`          DATE         NOT NULL,
  `age_gestationnel`      INT          NULL,
  `poids`                 DECIMAL(5,2) NULL,
  `tension_systolique`    INT          NULL,
  `tension_diastolique`   INT          NULL,
  `temperature`           DECIMAL(4,1) NULL,
  `hauteur_uterine`       DECIMAL(5,1) NULL,
  `frequence_cardiaque_mere` INT       NULL,
  `bfc`                   INT          NULL,
  `presentation_foetale`  VARCHAR(30)  NULL,
  `mouvements_actifs`     TINYINT(1)   NULL,
  `oedemes`               TINYINT(1)   NULL,
  `varices`               TINYINT(1)   NULL,
  `etat_general`          VARCHAR(20)  NULL,
  `perimetre_brachial`    DECIMAL(4,1) NULL,
  `prote_inurie`          VARCHAR(10)  NULL,
  `paleur`                TINYINT(1)   NULL,
  `ecoulement_vaginal`    TINYINT(1)   NULL,
  `ulcerations_genitales` TINYINT(1)   NULL,
  `etat_du_col`           TEXT         NULL,
  `observations`          TEXT         NULL,
  `traitement_prescrit`   TEXT         NULL,
  `prochain_rdv_date`     DATE         NULL,
  `prochain_rdv_notes`    TEXT         NULL,
  `cree_le`               DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le`         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_contacts_cpn_dossier`
    FOREIGN KEY (`dossier_cpn_id`) REFERENCES `dossiers_cpn` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. Examens CPN
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `examens_cpn` (
  `id`               CHAR(36)     NOT NULL,
  `dossier_cpn_id`   CHAR(36)     NOT NULL,
  `contact_cpn_id`   CHAR(36)     NULL,
  `type_examen`      VARCHAR(30)  NOT NULL,
  `libelle`          VARCHAR(200) NOT NULL,
  `statut`           VARCHAR(20)  NOT NULL DEFAULT 'DEMANDE',
  `source`           VARCHAR(20)  NOT NULL DEFAULT 'INTERNE',
  `resultat`         TEXT         NULL,
  `date_examen`      DATE         NULL,
  `date_resultat`    DATE         NULL,
  `notes`            TEXT         NULL,
  `pris_en_charge_le` DATETIME    NULL,
  `envoye_le`        DATETIME     NULL,
  `cree_le`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_examens_cpn_dossier`
    FOREIGN KEY (`dossier_cpn_id`) REFERENCES `dossiers_cpn` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_examens_cpn_contact`
    FOREIGN KEY (`contact_cpn_id`) REFERENCES `contacts_cpn` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. Accouchements
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `accouchements` (
  `id`                      CHAR(36)     NOT NULL,
  `numero_accouchement`     VARCHAR(20)  NOT NULL,
  `patiente_id`             CHAR(36)     NOT NULL,
  `dossier_cpn_id`          CHAR(36)     NULL,
  `type_accouchement`       VARCHAR(20)  NOT NULL DEFAULT 'INTERNE',
  `date_accouchement`       DATE         NOT NULL,
  `age_gestationnel`        INT          NULL,
  `mode_accouchement`       VARCHAR(30)  NOT NULL DEFAULT 'NATUREL',
  `etat_mere`               VARCHAR(30)  NOT NULL DEFAULT 'STABLE',
  `complications_mere`      TEXT         NULL,
  `perte_sanguine_ml`       INT          NULL,
  `nombre_nouveaux_nes`     INT          NOT NULL DEFAULT 1,
  `etat_nouveau_ne`         VARCHAR(20)  NOT NULL DEFAULT 'VIVANT',
  `sexe_nouveau_ne`         CHAR(1)      NULL,
  `poids_naissance_g`       INT          NULL,
  `score_apgar_1min`        INT          NULL,
  `score_apgar_5min`        INT          NULL,
  `anomalies_congenitales`  TEXT         NULL,
  `statut`                  VARCHAR(20)  NOT NULL DEFAULT 'EN_COURS',
  `cps_femme_id`            CHAR(36)     NULL,
  `dossier_enfant_id`       CHAR(36)     NULL,
  `notes`                   TEXT         NULL,
  `enregistre_par`          VARCHAR(200) NULL,
  `cree_le`                 DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_accouchements_numero` (`numero_accouchement`),
  CONSTRAINT `FK_accouchements_patiente`
    FOREIGN KEY (`patiente_id`) REFERENCES `patientes` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_accouchements_dossier_cpn`
    FOREIGN KEY (`dossier_cpn_id`) REFERENCES `dossiers_cpn` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 12. Dossiers CPS Femme
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dossiers_cps_femme` (
  `id`                         CHAR(36)     NOT NULL,
  `numero_dossier_cps`         VARCHAR(20)  NOT NULL,
  `patiente_id`                CHAR(36)     NOT NULL,
  `accouchement_id`            CHAR(36)     NULL,
  `dossier_cpn_id`             CHAR(36)     NULL,
  `type_accouchement_entree`   VARCHAR(20)  NOT NULL DEFAULT 'INTERNE',
  `date_ouverture`             DATE         NOT NULL,
  `date_accouchement`          DATE         NULL,
  `mode_accouchement`          VARCHAR(30)  NOT NULL DEFAULT 'NATUREL',
  `etat_mere_entree`           VARCHAR(30)  NOT NULL DEFAULT 'STABLE',
  `complications_accouchement` TEXT         NULL,
  `nombre_nouveaux_nes`        INT          NULL,
  `etat_nouveau_ne`            VARCHAR(20)  NOT NULL DEFAULT 'VIVANT',
  `sexe_nouveau_ne`            CHAR(1)      NULL,
  `poids_naissance_g`          INT          NULL,
  `score_apgar_1min`           INT          NULL,
  `score_apgar_5min`           INT          NULL,
  `gestite`                    INT          NULL,
  `parite`                     INT          NULL,
  `groupe_sanguin`             VARCHAR(5)   NULL,
  `rhesus`                     VARCHAR(5)   NULL,
  `vih_statut`                 VARCHAR(20)  NOT NULL DEFAULT 'INCONNU',
  `statut`                     VARCHAR(10)  NOT NULL DEFAULT 'OUVERT',
  `date_cloture`               DATE         NULL,
  `clos_par`                   VARCHAR(150) NULL,
  `notes_cloture`              TEXT         NULL,
  `notes`                      TEXT         NULL,
  `cree_le`                    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le`              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_dossiers_cps_femme_numero` (`numero_dossier_cps`),
  CONSTRAINT `FK_dossiers_cps_femme_patiente`
    FOREIGN KEY (`patiente_id`) REFERENCES `patientes` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `FK_dossiers_cps_femme_cpn`
    FOREIGN KEY (`dossier_cpn_id`) REFERENCES `dossiers_cpn` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 13. Visites CPS Femme
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `visites_cps_femme` (
  `id`                     CHAR(36)     NOT NULL,
  `dossier_cps_id`         CHAR(36)     NOT NULL,
  `type_visite`            VARCHAR(20)  NOT NULL,
  `numero_visite`          INT          NULL,
  `date_visite`            DATE         NOT NULL,
  `poids`                  DECIMAL(5,2) NULL,
  `tension_systolique`     INT          NULL,
  `tension_diastolique`    INT          NULL,
  `temperature`            DECIMAL(4,1) NULL,
  `frequence_cardiaque`    INT          NULL,
  `etat_general`           VARCHAR(20)  NULL,
  `involution_uterine`     VARCHAR(30)  NULL,
  `etat_seins`             VARCHAR(30)  NULL,
  `allaitement`            VARCHAR(20)  NULL,
  `etat_plaie`             VARCHAR(30)  NULL,
  `saignements`            VARCHAR(30)  NULL,
  `lochies`                VARCHAR(30)  NULL,
  `etat_psychologique`     VARCHAR(30)  NULL,
  `oedemes`                TINYINT(1)   NULL,
  `paleur`                 TINYINT(1)   NULL,
  `perimetre_brachial`     DECIMAL(4,1) NULL,
  `contraception_discutee` TINYINT(1)   NOT NULL DEFAULT 0,
  `methode_contraceptive`  VARCHAR(50)  NULL,
  `conduite_a_tenir`       TEXT         NULL,
  `traitement_prescrit`    TEXT         NULL,
  `prochain_rdv_date`      DATE         NULL,
  `observations`           TEXT         NULL,
  `cree_le`                DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_visites_cps_femme_dossier`
    FOREIGN KEY (`dossier_cps_id`) REFERENCES `dossiers_cps_femme` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 14. Suivis enfants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `suivis_enfants` (
  `id`                          CHAR(36)     NOT NULL,
  `enfant_id`                   CHAR(36)     NOT NULL,
  `date_visite`                 DATE         NOT NULL,
  `age_mois`                    INT          NULL,
  `poids_kg`                    DECIMAL(5,3) NULL,
  `taille_cm`                   DECIMAL(5,1) NULL,
  `perimetre_cranien_cm`        DECIMAL(4,1) NULL,
  `perimetre_brachial_cm`       DECIMAL(4,1) NULL,
  `temperature_celsius`         DECIMAL(4,1) NULL,
  `frequence_cardiaque`         INT          NULL,
  `frequence_respiratoire`      INT          NULL,
  `etat_general`                VARCHAR(20)  NULL,
  `couleur_peau`                VARCHAR(20)  NULL,
  `oedemes`                     TINYINT(1)   NOT NULL DEFAULT 0,
  `deshydratation`              TINYINT(1)   NOT NULL DEFAULT 0,
  `developpement_psychomoteur`  VARCHAR(30)  NULL,
  `allaitement`                 VARCHAR(20)  NULL,
  `motif`                       TEXT         NULL,
  `diagnostics`                 TEXT         NULL,
  `conduite_a_tenir`            TEXT         NULL,
  `traitement_prescrit`         TEXT         NULL,
  `prochain_rdv_date`           DATE         NULL,
  `observations`                TEXT         NULL,
  `cree_le`                     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `mis_a_jour_le`               DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_suivis_enfants_enfant`
    FOREIGN KEY (`enfant_id`) REFERENCES `enfants` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 15. Nutritions enfants
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `nutritions_enfants` (
  `id`                     CHAR(36)     NOT NULL,
  `enfant_id`              CHAR(36)     NOT NULL,
  `date_evaluation`        DATE         NOT NULL,
  `age_mois`               INT          NULL,
  `poids_kg`               DECIMAL(5,3) NULL,
  `taille_cm`              DECIMAL(5,1) NULL,
  `perimetre_brachial_cm`  DECIMAL(4,1) NULL,
  `statut_nutritionnel`    VARCHAR(20)  NULL,
  `z_score_poids_age`      DECIMAL(5,2) NULL,
  `z_score_taille_age`     DECIMAL(5,2) NULL,
  `z_score_poids_taille`   DECIMAL(5,2) NULL,
  `type_alimentation`      VARCHAR(20)  NULL,
  `diversification_demarree` TINYINT(1) NOT NULL DEFAULT 0,
  `oedemes`                TINYINT(1)   NOT NULL DEFAULT 0,
  `prise_en_charge`        VARCHAR(30)  NULL,
  `aliment_therapeutique`  VARCHAR(100) NULL,
  `observations`           TEXT         NULL,
  `cree_le`                DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `mis_a_jour_le`          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_nutritions_enfants_enfant`
    FOREIGN KEY (`enfant_id`) REFERENCES `enfants` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 16. Vaccinations / doses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vaccinations_doses` (
  `id`                   CHAR(36)     NOT NULL,
  `enfant_id`            CHAR(36)     NOT NULL,
  `vaccin`               VARCHAR(50)  NOT NULL,
  `numero_dose`          INT          NOT NULL DEFAULT 1,
  `date_administration`  DATE         NOT NULL,
  `age_mois`             INT          NULL,
  `numero_lot`           VARCHAR(50)  NULL,
  `statut`               VARCHAR(20)  NOT NULL DEFAULT 'ADMINISTREE',
  `motif_report`         TEXT         NULL,
  `prochaine_dose_date`  DATE         NULL,
  `observations`         TEXT         NULL,
  `cree_le`              DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `mis_a_jour_le`        DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_vaccinations_doses_enfant`
    FOREIGN KEY (`enfant_id`) REFERENCES `enfants` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 17. Dossiers CPS Enfant
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dossiers_cps_enfant` (
  `id`                  CHAR(36)     NOT NULL,
  `numero_dossier_cps`  VARCHAR(30)  NOT NULL,
  `enfant_id`           CHAR(36)     NOT NULL,
  `mere_nom`            VARCHAR(200) NULL,
  `mere_telephone`      VARCHAR(30)  NULL,
  `date_ouverture`      DATE         NOT NULL,
  `date_naissance`      DATE         NOT NULL,
  `type_accouchement`   VARCHAR(20)  NOT NULL DEFAULT 'INTERNE',
  `poids_naissance_g`   INT          NULL,
  `score_apgar_1min`    INT          NULL,
  `score_apgar_5min`    INT          NULL,
  `groupe_sanguin`      VARCHAR(5)   NULL,
  `rhesus`              VARCHAR(5)   NULL,
  `vih_statut`          VARCHAR(20)  NOT NULL DEFAULT 'INCONNU',
  `statut`              VARCHAR(10)  NOT NULL DEFAULT 'OUVERT',
  `notes`               TEXT         NULL,
  `cree_le`             DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `mis_a_jour_le`       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_dossiers_cps_enfant_numero` (`numero_dossier_cps`),
  CONSTRAINT `FK_dossiers_cps_enfant_enfant`
    FOREIGN KEY (`enfant_id`) REFERENCES `enfants` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 18. Visites CPS Enfant
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `visites_cps_enfant` (
  `id`                          CHAR(36)     NOT NULL,
  `dossier_cps_enfant_id`       CHAR(36)     NOT NULL,
  `type_visite`                 VARCHAR(20)  NOT NULL,
  `date_visite`                 DATE         NOT NULL,
  `age_jours`                   INT          NULL,
  `poids_kg`                    DECIMAL(5,3) NULL,
  `taille_cm`                   DECIMAL(5,1) NULL,
  `perimetre_cranien_cm`        DECIMAL(4,1) NULL,
  `temperature_celsius`         DECIMAL(4,1) NULL,
  `frequence_cardiaque`         INT          NULL,
  `frequence_respiratoire`      INT          NULL,
  `etat_general`                VARCHAR(20)  NULL,
  `allaitement`                 VARCHAR(20)  NULL,
  `prise_biberon`               TINYINT(1)   NULL,
  `couleur_peau`                VARCHAR(20)  NULL,
  `oedemes`                     TINYINT(1)   NOT NULL DEFAULT 0,
  `infection_cutanee`           VARCHAR(30)  NULL,
  `ictere`                      TINYINT(1)   NOT NULL DEFAULT 0,
  `convulsions`                 TINYINT(1)   NOT NULL DEFAULT 0,
  `etat_cordon`                 VARCHAR(20)  NULL,
  `developpement_psychomoteur`  VARCHAR(30)  NULL,
  `vaccins_administres`         TEXT         NULL,
  `motif`                       TEXT         NULL,
  `diagnostics`                 TEXT         NULL,
  `conduite_a_tenir`            TEXT         NULL,
  `traitement_prescrit`         TEXT         NULL,
  `prochain_rdv_date`           DATE         NULL,
  `prochain_type_visite`        VARCHAR(20)  NULL,
  `agent_sante`                 VARCHAR(100) NULL,
  `observations`                TEXT         NULL,
  `cree_le`                     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `mis_a_jour_le`               DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_visites_cps_enfant_dossier`
    FOREIGN KEY (`dossier_cps_enfant_id`) REFERENCES `dossiers_cps_enfant` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 19. Données initiales — Rôles
-- ------------------------------------------------------------
INSERT INTO `roles` (`id`, `code`, `libelle`) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ADMIN',       'Administrateur'),
  ('22222222-2222-2222-2222-222222222222', 'SUPER_ADMIN',  'Super administrateur'),
  ('33333333-3333-3333-3333-333333333333', 'MEDECIN',      'Médecin'),
  ('44444444-4444-4444-4444-444444444444', 'SAGE_FEMME',   'Sage-femme'),
  ('55555555-5555-5555-5555-555555555555', 'INFIRMIERE',   'Infirmière'),
  ('66666666-6666-6666-6666-666666666666', 'RECEPTION',    'Réception'),
  ('77777777-7777-7777-7777-777777777777', 'LABORANTIN',   'Laborantin')
ON DUPLICATE KEY UPDATE `libelle` = VALUES(`libelle`);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Fin du script
-- ============================================================
