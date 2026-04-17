import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccouchementsController } from './accouchements.controller';
import { AccouchementsService } from './accouchements.service';
import { AccouchementEntity } from './entities/accouchement.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';

// Ce module regroupe l entite, le service et le controleur du domaine accouchements.
@Module({
  imports: [TypeOrmModule.forFeature([AccouchementEntity, PatienteEntity])],
  controllers: [AccouchementsController],
  providers: [AccouchementsService],
  exports: [AccouchementsService],
})
export class AccouchementsModule {}
