const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection({ host:'localhost', user:'root', password:'12345', database:'cpn_cps_himbi', port:3306 });
  await conn.query(`
    CREATE TABLE IF NOT EXISTS examens_enfants (
      id CHAR(36) NOT NULL,
      enfant_id CHAR(36) NOT NULL,
      suivi_enfant_id CHAR(36) NULL,
      type_examen VARCHAR(30) NOT NULL,
      libelle VARCHAR(200) NOT NULL,
      statut VARCHAR(20) NOT NULL DEFAULT 'DEMANDE',
      source VARCHAR(20) NOT NULL DEFAULT 'INTERNE',
      resultat TEXT NULL,
      date_examen DATE NULL,
      date_resultat DATE NULL,
      notes TEXT NULL,
      pris_en_charge_le DATETIME NULL,
      envoye_le DATETIME NULL,
      cree_le DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      mis_a_jour_le DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      PRIMARY KEY (id),
      INDEX idx_enfant (enfant_id),
      INDEX idx_statut (statut),
      INDEX idx_type (type_examen),
      CONSTRAINT fk_examen_enfant FOREIGN KEY (enfant_id) REFERENCES enfants(id) ON DELETE CASCADE,
      CONSTRAINT fk_examen_suivi FOREIGN KEY (suivi_enfant_id) REFERENCES suivis_enfants(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Table examens_enfants creee (ou existante).');
  await conn.end();
}
main().catch(console.error);
