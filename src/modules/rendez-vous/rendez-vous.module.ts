import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RendezVousController } from './rendez-vous.controller';
import { RendezVousService } from './rendez-vous.service';
import { RendezVousEntity } from './entities/rendez-vous.entity';

// Ce module configure le module rendez-vous et enregistre l'entite pour l'injection.
@Module({
  imports: [TypeOrmModule.forFeature([RendezVousEntity])],
  controllers: [RendezVousController],
  providers: [RendezVousService],
})
export class RendezVousModule {}
