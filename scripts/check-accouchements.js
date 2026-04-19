// Vérifie si la table accouchements existe en base de données
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'cpn_cps_himbi',
  });

  const [rows] = await conn.query("SHOW TABLES LIKE 'accouchements'");
  if (rows.length > 0) {
    console.log('TABLE accouchements : EXISTE');
    const [cols] = await conn.query('DESCRIBE accouchements');
    console.log('Colonnes :', cols.map(c => c.Field).join(', '));
  } else {
    console.log('TABLE accouchements : MANQUANTE');
  }
  await conn.end();
}

main().catch(console.error);
