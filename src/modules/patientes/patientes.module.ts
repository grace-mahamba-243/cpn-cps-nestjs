import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientesController } from './patientes.controller';
import { PatientesService } from './patientes.service';
import { PatienteEntity } from './entities/patiente.entity';
import { JournalModule } from '../journal/journal.module';

// Ce module configure le module patientes et enregistre l'entite pour l'injection.
@Module({
  imports: [TypeOrmModule.forFeature([PatienteEntity]), JournalModule],
  controllers: [PatientesController],
  providers: [PatientesService],
  exports: [PatientesService],
})
export class PatientesModule {}
