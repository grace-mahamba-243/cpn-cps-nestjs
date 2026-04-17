import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientesController } from './patientes.controller';
import { PatientesService } from './patientes.service';
import { PatienteEntity } from './entities/patiente.entity';

// Ce module configure le module patientes et enregistre l'entite pour l'injection.
@Module({
  imports: [TypeOrmModule.forFeature([PatienteEntity])],
  controllers: [PatientesController],
  providers: [PatientesService],
  exports: [PatientesService],
})
export class PatientesModule {}
