import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnfantsController } from './enfants.controller';
import { EnfantsService } from './enfants.service';
import { EnfantEntity } from './entities/enfant.entity';
import { ExamenEnfantEntity } from './entities/examen-enfant.entity';
import { JournalModule } from '../journal/journal.module';

// Ce module configure le module enfants et enregistre l'entite pour l'injection.
@Module({
  imports: [TypeOrmModule.forFeature([EnfantEntity, ExamenEnfantEntity]), JournalModule],
  controllers: [EnfantsController],
  providers: [EnfantsService],
  exports: [EnfantsService],
})
export class EnfantsModule {}
