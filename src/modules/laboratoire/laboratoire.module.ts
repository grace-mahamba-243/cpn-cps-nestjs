import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaboratoireController } from './laboratoire.controller';
import { LaboratoireService } from './laboratoire.service';
import { ExamenCpnEntity } from '../cpn/entities/examen-cpn.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { ContactCpnEntity } from '../cpn/entities/contact-cpn.entity';
import { ExamenEnfantEntity } from '../enfants/entities/examen-enfant.entity';
import { EnfantEntity } from '../enfants/entities/enfant.entity';
import { ExamenCpsFemmeEntity } from '../cps-femme/entities/examen-cps-femme.entity';
import { DossierCpsFemmeEntity } from '../cps-femme/entities/dossier-cps-femme.entity';
import { ExamenCpsEnfantEntity } from '../cps-enfant/entities/examen-cps-enfant.entity';
import { DossierCpsEnfantEntity } from '../cps-enfant/entities/dossier-cps-enfant.entity';
import { JournalModule } from '../journal/journal.module';

// Ce module regroupe les composants du laboratoire : demandes, resultats et suivi.
@Module({
  imports: [TypeOrmModule.forFeature([
    ExamenCpnEntity, DossierCpnEntity, ContactCpnEntity,
    ExamenEnfantEntity, EnfantEntity,
    ExamenCpsFemmeEntity, DossierCpsFemmeEntity,
    ExamenCpsEnfantEntity, DossierCpsEnfantEntity,
  ]), JournalModule],
  controllers: [LaboratoireController],
  providers: [LaboratoireService],
})
export class LaboratoireModule {}
