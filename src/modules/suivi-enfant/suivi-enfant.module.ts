import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuiviEnfantController } from './suivi-enfant.controller';
import { SuiviEnfantService } from './suivi-enfant.service';
import { SuiviEnfantEntity } from './entities/suivi-enfant.entity';

// Ce module regroupe les composants du suivi clinique enfant.
@Module({
  imports: [TypeOrmModule.forFeature([SuiviEnfantEntity])],
  controllers: [SuiviEnfantController],
  providers: [SuiviEnfantService],
  exports: [SuiviEnfantService],
})
export class SuiviEnfantModule {}
