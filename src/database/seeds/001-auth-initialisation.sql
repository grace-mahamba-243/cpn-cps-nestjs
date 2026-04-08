CREATE DATABASE IF NOT EXISTS cpn_cps_himbi
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cpn_cps_himbi;

CREATE TABLE IF NOT EXISTS roles (
  id CHAR(36) NOT NULL,
  code VARCHAR(100) NOT NULL,
  libelle VARCHAR(150) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_code (code)
);

CREATE TABLE IF NOT EXISTS utilisateurs (
  id CHAR(36) NOT NULL,
  identifiant VARCHAR(150) NOT NULL,
  nom_affichage VARCHAR(200) NOT NULL,
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  actif TINYINT(1) NOT NULL DEFAULT 1,
  role_id CHAR(36) NOT NULL,
  dernier_acces_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_utilisateurs_identifiant (identifiant),
  KEY idx_utilisateurs_role_id (role_id),
  CONSTRAINT fk_utilisateurs_role_id
    FOREIGN KEY (role_id) REFERENCES roles(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sessions_authentification (
  id CHAR(36) NOT NULL,
  utilisateur_id CHAR(36) NOT NULL,
  jeton_session VARCHAR(255) NOT NULL,
  expire_le DATETIME NOT NULL,
  est_active TINYINT(1) NOT NULL DEFAULT 1,
  cree_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoquee_le DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sessions_authentification_jeton_session (jeton_session),
  KEY idx_sessions_authentification_utilisateur_id (utilisateur_id),
  CONSTRAINT fk_sessions_authentification_utilisateur_id
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

INSERT INTO roles (id, code, libelle)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'ADMIN', 'Administrateur'),
  ('22222222-2222-2222-2222-222222222222', 'SUPERVISEUR', 'Superviseur'),
  ('33333333-3333-3333-3333-333333333333', 'AGENT_CLINIQUE', 'Agent clinique')
ON DUPLICATE KEY UPDATE
  libelle = VALUES(libelle);

INSERT INTO utilisateurs (
  id,
  identifiant,
  nom_affichage,
  mot_de_passe_hash,
  actif,
  role_id,
  dernier_acces_at
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'admin',
    'Administrateur Systeme',
    'admin1234',
    1,
    '11111111-1111-1111-1111-111111111111',
    NULL
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'superviseur',
    'Superviseur Clinique',
    'super1234',
    1,
    '22222222-2222-2222-2222-222222222222',
    NULL
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'agent',
    'Agent Clinique',
    'agent1234',
    1,
    '33333333-3333-3333-3333-333333333333',
    NULL
  )
ON DUPLICATE KEY UPDATE
  nom_affichage = VALUES(nom_affichage),
  mot_de_passe_hash = VALUES(mot_de_passe_hash),
  actif = VALUES(actif),
  role_id = VALUES(role_id);