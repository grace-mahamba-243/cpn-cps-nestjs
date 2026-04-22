const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection({ host:'localhost', user:'root', password:'12345', database:'cpn_cps_himbi', port:3306 });
  
  const [tables] = await conn.query("SHOW TABLES LIKE 'journal_activites'");
  console.log('Table journal_activites existe:', tables.length > 0);
  if (tables.length > 0) {
    const [rows] = await conn.query('SELECT COUNT(*) as total FROM journal_activites');
    console.log('Nombre entrees journal:', rows[0].total);
    const [cols] = await conn.query('DESCRIBE journal_activites');
    console.log('Colonnes:', cols.map(c => c.Field).join(', '));
  }

  const tablesList = ['patientes','dossiers_cpn','contacts_cpn','accouchements','dossiers_cps_femme','visites_cps_femme','dossiers_cps_enfant','visites_cps_enfant','enfants','rendez_vous'];
  for (const t of tablesList) {
    const [cols] = await conn.query('DESCRIBE ' + t);
    const colNames = cols.map(c => c.Field);
    console.log(t + ': enregistre_par=' + colNames.includes('enregistre_par') + ', modifie_par=' + colNames.includes('modifie_par'));
  }
  await conn.end();
}
main().catch(console.error);
