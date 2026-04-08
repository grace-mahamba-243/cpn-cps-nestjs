import { Module } from '@nestjs/common';
import { PatientesController } from './patientes.controller';
import { PatientesService } from './patientes.service';

// Ce module regroupe les composants techniques et metier de base de patientes.
@Module({
  controllers: [PatientesController],
  providers: [PatientesService],
})
export class PatientesModule {}
