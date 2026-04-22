const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection({ host:'localhost', user:'root', password:'12345', database:'cpn_cps_himbi', port:3306 });
  
  const tables = [
    'patientes', 'dossiers_cpn', 'contacts_cpn', 'examens_cpn',
    'dossiers_cps_femme', 'visites_cps_femme', 'examens_cps_femme',
    'dossiers_cps_enfant', 'visites_cps_enfant', 'examens_cps_enfant',
    'enfants', 'examens_enfants', 'suivis_enfants', 'vaccinations_doses', 'rendez_vous'
  ];

  for (const t of tables) {
    const [cols] = await conn.query('DESCRIBE ' + t);
    const colNames = cols.map(c => c.Field);
    
    if (!colNames.includes('enregistre_par')) {
      await conn.query(`ALTER TABLE \`${t}\` ADD COLUMN enregistre_par varchar(200) NULL`);
      console.log(t + ': enregistre_par ADDED');
    } else {
      console.log(t + ': enregistre_par already exists');
    }
    
    if (!colNames.includes('modifie_par')) {
      await conn.query(`ALTER TABLE \`${t}\` ADD COLUMN modifie_par varchar(200) NULL`);
      console.log(t + ': modifie_par ADDED');
    } else {
      console.log(t + ': modifie_par already exists');
    }
  }

  // accouchements already has enregistre_par, just add modifie_par
  const [accCols] = await conn.query('DESCRIBE accouchements');
  const accColNames = accCols.map(c => c.Field);
  if (!accColNames.includes('modifie_par')) {
    await conn.query('ALTER TABLE accouchements ADD COLUMN modifie_par varchar(200) NULL');
    console.log('accouchements: modifie_par ADDED');
  }
  if (!accColNames.includes('enregistre_par')) {
    await conn.query('ALTER TABLE accouchements ADD COLUMN enregistre_par varchar(200) NULL');
    console.log('accouchements: enregistre_par ADDED');
  }

  console.log('Done!');
  await conn.end();
}
main().catch(console.error);
