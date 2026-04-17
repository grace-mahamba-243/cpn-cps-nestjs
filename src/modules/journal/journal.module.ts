import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalActiviteEntity } from './entities/journal-activite.entity';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';

// Ce module regroupe le journal d'activites de l'application.
@Module({
  imports: [TypeOrmModule.forFeature([JournalActiviteEntity])],
  controllers: [JournalController],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalModule {}
