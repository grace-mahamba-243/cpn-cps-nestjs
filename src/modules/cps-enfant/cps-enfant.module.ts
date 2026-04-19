import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CpsEnfantController } from './cps-enfant.controller';
import { CpsEnfantService } from './cps-enfant.service';
import { DossierCpsEnfantEntity } from './entities/dossier-cps-enfant.entity';
import { VisiteCpsEnfantEntity } from './entities/visite-cps-enfant.entity';
import { EnfantEntity } from '../enfants/entities/enfant.entity';
import { ExamenCpsEnfantEntity } from './entities/examen-cps-enfant.entity';

// Ce module regroupe les entites et la logique metier du suivi postnatal CPS Enfant.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      DossierCpsEnfantEntity,
      VisiteCpsEnfantEntity,
      EnfantEntity,
      ExamenCpsEnfantEntity,
    ]),
  ],
  controllers: [CpsEnfantController],
  providers: [CpsEnfantService],
  exports: [CpsEnfantService],
})
export class CpsEnfantModule {}
