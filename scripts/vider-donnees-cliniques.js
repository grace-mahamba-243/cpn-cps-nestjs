// Script pour vider toutes les données cliniques (CPN, Accouchements, CPS Femme, CPS Enfant)
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'cpn_cps_himbi',
  });

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  const tables = [
    'examens_cpn',
    'contacts_cpn',
    'dossiers_cpn',
    'accouchements',
    'visites_cps_femme',
    'dossiers_cps_femme',
    'visites_cps_enfants',
    'dossiers_cps_enfants',
    'suivis_enfants',
    'nutritions_enfants',
    'vaccinations_doses',
  ];

  for (const table of tables) {
    try {
      const [res] = await conn.query(`DELETE FROM \`${table}\``);
      console.log(`✓ ${table} — ${res.affectedRows} ligne(s) supprimée(s)`);
    } catch (e) {
      if (e.code === 'ER_NO_SUCH_TABLE') {
        console.log(`— ${table} : table inexistante, ignorée`);
      } else {
        console.error(`✗ ${table} : ${e.message}`);
      }
    }
  }

  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  await conn.end();
  console.log('\nTerminé.');
}

main().catch(console.error);
