// Script pour ajouter les colonnes manquantes dans la table enfants
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'cpn_cps_himbi',
    multipleStatements: true,
  });

  console.log('Connexion réussie. Ajout des colonnes manquantes dans enfants...');

  // Créer suivis_enfants si absent
  const [suiviRows] = await conn.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'suivis_enfants'");
  if (suiviRows.length === 0) {
    await conn.execute(`CREATE TABLE \`suivis_enfants\` (
      \`id\` char(36) NOT NULL,
      \`enfant_id\` char(36) NOT NULL,
      \`date_visite\` date NOT NULL,
      \`age_mois\` int NULL,
      \`poids_kg\` decimal(5,3) NULL,
      \`taille_cm\` decimal(5,1) NULL,
      \`perimetre_cranien_cm\` decimal(4,1) NULL,
      \`perimetre_brachial_cm\` decimal(4,1) NULL,
      \`temperature_celsius\` decimal(4,1) NULL,
      \`frequence_cardiaque\` int NULL,
      \`frequence_respiratoire\` int NULL,
      \`etat_general\` varchar(20) NULL,
      \`couleur_peau\` varchar(20) NULL,
      \`oedemes\` tinyint(1) NOT NULL DEFAULT 0,
      \`deshydratation\` tinyint(1) NOT NULL DEFAULT 0,
      \`developpement_psychomoteur\` varchar(30) NULL,
      \`allaitement\` varchar(20) NULL,
      \`motif\` text NULL,
      \`diagnostics\` text NULL,
      \`conduite_a_tenir\` text NULL,
      \`traitement_prescrit\` text NULL,
      \`prochain_rdv_date\` date NULL,
      \`observations\` text NULL,
      \`cree_le\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`mis_a_jour_le\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_suivis_enfants_enfant\` FOREIGN KEY (\`enfant_id\`) REFERENCES \`enfants\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    console.log('✅ Table suivis_enfants créée');
  } else {
    console.log('ℹ️ Table suivis_enfants déjà présente');
  }

  // Créer nutritions_enfants si absent
  const [nutRows] = await conn.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nutritions_enfants'");
  if (nutRows.length === 0) {
    await conn.execute(`CREATE TABLE \`nutritions_enfants\` (
      \`id\` char(36) NOT NULL,
      \`enfant_id\` char(36) NOT NULL,
      \`date_evaluation\` date NOT NULL,
      \`age_mois\` int NULL,
      \`poids_kg\` decimal(5,3) NULL,
      \`taille_cm\` decimal(5,1) NULL,
      \`perimetre_brachial_cm\` decimal(4,1) NULL,
      \`statut_nutritionnel\` varchar(20) NULL,
      \`z_score_poids_age\` decimal(5,2) NULL,
      \`z_score_taille_age\` decimal(5,2) NULL,
      \`z_score_poids_taille\` decimal(5,2) NULL,
      \`type_alimentation\` varchar(20) NULL,
      \`diversification_demarree\` tinyint(1) NOT NULL DEFAULT 0,
      \`oedemes\` tinyint(1) NOT NULL DEFAULT 0,
      \`prise_en_charge\` varchar(30) NULL,
      \`aliment_therapeutique\` varchar(100) NULL,
      \`observations\` text NULL,
      \`cree_le\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`mis_a_jour_le\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_nutritions_enfants_enfant\` FOREIGN KEY (\`enfant_id\`) REFERENCES \`enfants\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    console.log('✅ Table nutritions_enfants créée');
  } else {
    console.log('ℹ️ Table nutritions_enfants déjà présente');
  }

  // Créer la table vaccinations_doses si elle n'existe pas
  const [tabRows] = await conn.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vaccinations_doses'");
  if (tabRows.length === 0) {
    await conn.execute(`CREATE TABLE \`vaccinations_doses\` (
      \`id\` char(36) NOT NULL,
      \`enfant_id\` char(36) NOT NULL,
      \`vaccin\` varchar(50) NOT NULL,
      \`numero_dose\` int NOT NULL DEFAULT 1,
      \`date_administration\` date NOT NULL,
      \`age_mois\` int NULL,
      \`numero_lot\` varchar(50) NULL,
      \`statut\` varchar(20) NOT NULL DEFAULT 'ADMINISTREE',
      \`motif_report\` text NULL,
      \`prochaine_dose_date\` date NULL,
      \`observations\` text NULL,
      \`cree_le\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`mis_a_jour_le\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      CONSTRAINT \`FK_vaccinations_doses_enfant\` FOREIGN KEY (\`enfant_id\`) REFERENCES \`enfants\`(\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    console.log('✅ Table vaccinations_doses créée');
  } else {
    console.log('ℹ️ Table vaccinations_doses déjà présente');
  }

  // Agrandir la colonne sexe (char(1) -> varchar(10) pour MASCULIN/FEMININ)
  try {
    await conn.execute('ALTER TABLE `enfants` MODIFY COLUMN `sexe` varchar(10) NOT NULL');
    console.log('✅ sexe modifié en varchar(10)');
  } catch (e) {
    console.error('❌ Erreur sexe:', e.message);
  }

  // Rendre numero_fiche nullable (ancienne colonne, remplacée par numero_dossier)
  try {
    await conn.execute('ALTER TABLE `enfants` MODIFY COLUMN `numero_fiche` varchar(30) NULL');
    console.log('✅ numero_fiche rendu nullable');
  } catch (e) {
    if (e.message.includes("Unknown column")) {
      console.log("ℹ️ numero_fiche n'existe pas, ignoré");
    } else {
      console.error('❌ Erreur numero_fiche:', e.message);
    }
  }

  const columns = [
    { name: 'numero_dossier', def: "varchar(30) NULL" },
    { name: 'patiente_id', def: "char(36) NULL" },
    { name: 'lieu_naissance', def: "varchar(20) NOT NULL DEFAULT 'INTERNE'" },
    { name: 'poids_naissance_g', def: "int NULL" },
    { name: 'score_apgar_1min', def: "int NULL" },
    { name: 'score_apgar_5min', def: "int NULL" },
    { name: 'etat_naissance', def: "varchar(20) NOT NULL DEFAULT 'VIVANT'" },
    { name: 'age_gestationnel_semaines', def: "int NULL" },
    { name: 'statut', def: "varchar(10) NOT NULL DEFAULT 'OUVERT'" },
  ];

  // Vérifier colonnes existantes
  const [rows] = await conn.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'enfants'");
  const existing = rows.map(r => r.COLUMN_NAME);
  console.log('Colonnes existantes:', existing.join(', '));

  for (const { name, def } of columns) {
    if (existing.includes(name)) {
      console.log(`ℹ️ ${name} déjà présente, ignorée`);
      continue;
    }
    try {
      await conn.execute(`ALTER TABLE \`enfants\` ADD COLUMN \`${name}\` ${def}`);
      console.log(`✅ ${name} ajoutée`);
    } catch (e) {
      console.error(`❌ Erreur ${name}:`, e.message);
    }
  }

  // Copier numero_fiche vers numero_dossier si vide
  try {
    await conn.execute("UPDATE `enfants` SET `numero_dossier` = `numero_fiche` WHERE `numero_dossier` IS NULL AND `numero_fiche` IS NOT NULL");
    console.log('✅ numero_dossier mis à jour depuis numero_fiche');
  } catch (e) {
    console.log('ℹ️ Copie numero_fiche ignorée:', e.message);
  }

  await conn.end();
  console.log('Terminé.');
}

main().catch(console.error);
