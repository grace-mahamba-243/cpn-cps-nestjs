import { loadEnvFile } from 'node:process';
import dataSource from '../src/database/data-source';

// Ce script charge l'environnement puis applique les migrations TypeORM sans passer par le CLI.
async function executerMigrations() {
  loadEnvFile();

  await dataSource.initialize();

  try {
    const migrations = await dataSource.runMigrations();
    const noms = migrations.map((migration) => migration.name);

    console.log(
      noms.length > 0
        ? `Migrations appliquees: ${noms.join(', ')}`
        : 'Aucune nouvelle migration a appliquer.',
    );
  } finally {
    await dataSource.destroy();
  }
}

void executerMigrations();