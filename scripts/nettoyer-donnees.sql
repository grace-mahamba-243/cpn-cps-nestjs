-- ============================================================
-- Script de nettoyage des données cliniques et administratives
-- Conserve : utilisateurs, rôles
-- Supprime  : tout le reste (patients, CPN, RDV, enfants, etc.)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Données d'activité
DELETE FROM `journal_activites`;

-- Données CPN (enfants avant parents)
DELETE FROM `examens_cpn`;
DELETE FROM `contacts_cpn`;
DELETE FROM `dossiers_cpn`;

-- Rendez-vous
DELETE FROM `rendez_vous`;

-- Dossiers patients
DELETE FROM `enfants`;
DELETE FROM `patientes`;

-- Sessions (déconnecte tout le monde)
DELETE FROM `sessions_authentification`;

SET FOREIGN_KEY_CHECKS = 1;

-- Réinitialiser les séquences auto-increment si besoin
-- (non nécessaire pour les UUID, ignoré)

SELECT 'Nettoyage terminé. Utilisateurs et rôles conservés.' AS statut;
