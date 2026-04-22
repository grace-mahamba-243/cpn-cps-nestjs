const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'cpn_cps_himbi',
    port: 3306,
  });

  // Vérifier les utilisateurs avec le rôle EEEE
  const [users] = await conn.query(
    "SELECT COUNT(*) as n FROM utilisateurs WHERE role_id = 'c98919af-0a76-4511-898a-7170739bb11d'"
  );
  console.log('Utilisateurs avec rôle EEEE:', users[0].n);

  // Supprimer le rôle parasite EEEE
  const [del] = await conn.query("DELETE FROM roles WHERE code = 'EEEE'");
  console.log('Rôle EEEE supprimé, lignes affectées:', del.affectedRows);

  // Afficher les rôles restants
  const [roles] = await conn.query('SELECT code, libelle FROM roles ORDER BY code');
  console.log('\nRôles restants :');
  console.table(roles);

  await conn.end();
}

main().catch(console.error);
