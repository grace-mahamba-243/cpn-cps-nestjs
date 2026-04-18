import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CpsFemmeController } from './cps-femme.controller';
import { CpsFemmeService } from './cps-femme.service';
import { DossierCpsFemmeEntity } from './entities/dossier-cps-femme.entity';
import { VisiteCpsFemmeEntity } from './entities/visite-cps-femme.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { ContactCpnEntity } from '../cpn/entities/contact-cpn.entity';
import { ExamenCpnEntity } from '../cpn/entities/examen-cpn.entity';
import { EnfantEntity } from '../enfants/entities/enfant.entity';
import { JournalModule } from '../journal/journal.module';

// Ce module regroupe les entites et la logique metier du suivi postnatal CPS Femme.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      DossierCpsFemmeEntity,
      VisiteCpsFemmeEntity,
      PatienteEntity,
      DossierCpnEntity,
      ContactCpnEntity,
      ExamenCpnEntity,
      EnfantEntity,
    ]),
    JournalModule,
  ],
  controllers: [CpsFemmeController],
  providers: [CpsFemmeService],
  exports: [CpsFemmeService],
})
export class CpsFemmeModule {}
