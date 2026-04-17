import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaboratoireController } from './laboratoire.controller';
import { LaboratoireService } from './laboratoire.service';
import { ExamenCpnEntity } from '../cpn/entities/examen-cpn.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { ContactCpnEntity } from '../cpn/entities/contact-cpn.entity';

// Ce module regroupe les composants du laboratoire : demandes, resultats et suivi.
@Module({
  imports: [TypeOrmModule.forFeature([ExamenCpnEntity, DossierCpnEntity, ContactCpnEntity])],
  controllers: [LaboratoireController],
  providers: [LaboratoireService],
})
export class LaboratoireModule {}
