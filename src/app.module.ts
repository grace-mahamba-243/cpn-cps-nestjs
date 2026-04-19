import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { AccouchementsModule } from './modules/accouchements/accouchements.module';
import { AuthModule } from './modules/auth/auth.module';
import { CpnModule } from './modules/cpn/cpn.module';
import { CpsEnfantModule } from './modules/cps-enfant/cps-enfant.module';
import { CpsFemmeModule } from './modules/cps-femme/cps-femme.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DossiersModule } from './modules/dossiers/dossiers.module';
import { EnfantsModule } from './modules/enfants/enfants.module';
import { GrossessesModule } from './modules/grossesses/grossesses.module';
import { ImpressionsModule } from './modules/impressions/impressions.module';
import { LaboratoireModule } from './modules/laboratoire/laboratoire.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { PatientesModule } from './modules/patientes/patientes.module';
import { PharmacieModule } from './modules/pharmacie/pharmacie.module';
import { RendezVousModule } from './modules/rendez-vous/rendez-vous.module';
import { RolesModule } from './modules/roles/roles.module';
import { SuiviEnfantModule } from './modules/suivi-enfant/suivi-enfant.module';
import { UsersModule } from './modules/users/users.module';
import { VaccinationModule } from './modules/vaccination/vaccination.module';

// Ce module assemble la configuration globale et tous les domaines metier du backend.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env'],
      load: [appConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (dbConfig: ConfigType<typeof databaseConfig>) => ({
        type: 'mysql',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.name,
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: false,
        migrations: [join(__dirname, 'database', 'migrations', '*{.ts,.js}')],
      }),
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    PatientesModule,
    GrossessesModule,
    CpnModule,
    AccouchementsModule,
    CpsFemmeModule,
    CpsEnfantModule,
    EnfantsModule,
    SuiviEnfantModule,
    NutritionModule,
    VaccinationModule,
    RendezVousModule,
    DossiersModule,
    LaboratoireModule,
    PharmacieModule,
    ImpressionsModule,
    DashboardModule,
  ],
})
export class AppModule {}
