import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RendezVousController } from './rendez-vous.controller';
import { RendezVousService } from './rendez-vous.service';
import { RendezVousEntity } from './entities/rendez-vous.entity';
import { JournalModule } from '../journal/journal.module';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { ContactCpnEntity } from '../cpn/entities/contact-cpn.entity';
import { DossierCpsFemmeEntity } from '../cps-femme/entities/dossier-cps-femme.entity';
import { VisiteCpsFemmeEntity } from '../cps-femme/entities/visite-cps-femme.entity';
import { DossierCpsEnfantEntity } from '../cps-enfant/entities/dossier-cps-enfant.entity';
import { VisiteCpsEnfantEntity } from '../cps-enfant/entities/visite-cps-enfant.entity';

// Ce module configure le module rendez-vous et enregistre l'entite pour l'injection.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RendezVousEntity,
      DossierCpnEntity,
      ContactCpnEntity,
      DossierCpsFemmeEntity,
      VisiteCpsFemmeEntity,
      DossierCpsEnfantEntity,
      VisiteCpsEnfantEntity,
    ]),
    JournalModule,
  ],
  controllers: [RendezVousController],
  providers: [RendezVousService],
})
export class RendezVousModule {}
