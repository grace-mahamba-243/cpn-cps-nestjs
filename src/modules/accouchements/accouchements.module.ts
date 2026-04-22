import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccouchementsController } from './accouchements.controller';
import { AccouchementsService } from './accouchements.service';
import { AccouchementEntity } from './entities/accouchement.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { DossierCpsFemmeEntity } from '../cps-femme/entities/dossier-cps-femme.entity';
import { DossierCpsEnfantEntity } from '../cps-enfant/entities/dossier-cps-enfant.entity';
import { JournalModule } from '../journal/journal.module';

// Ce module regroupe l entite, le service et le controleur du domaine accouchements.
@Module({
  imports: [TypeOrmModule.forFeature([AccouchementEntity, PatienteEntity, DossierCpnEntity, DossierCpsFemmeEntity, DossierCpsEnfantEntity]), JournalModule],
  controllers: [AccouchementsController],
  providers: [AccouchementsService],
  exports: [AccouchementsService],
})
export class AccouchementsModule {}
