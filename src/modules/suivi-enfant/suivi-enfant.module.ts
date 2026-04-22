import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuiviEnfantController } from './suivi-enfant.controller';
import { SuiviEnfantService } from './suivi-enfant.service';
import { SuiviEnfantEntity } from './entities/suivi-enfant.entity';
import { JournalModule } from '../journal/journal.module';

// Ce module regroupe les composants du suivi clinique enfant.
@Module({
  imports: [TypeOrmModule.forFeature([SuiviEnfantEntity]), JournalModule],
  controllers: [SuiviEnfantController],
  providers: [SuiviEnfantService],
  exports: [SuiviEnfantService],
})
export class SuiviEnfantModule {}
