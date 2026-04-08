import { Module } from '@nestjs/common';
import { SuiviEnfantController } from './suivi-enfant.controller';
import { SuiviEnfantService } from './suivi-enfant.service';

// Ce module regroupe les composants techniques et metier de base de suivi-enfant.
@Module({
  controllers: [SuiviEnfantController],
  providers: [SuiviEnfantService],
})
export class SuiviEnfantModule {}
