import { Module } from '@nestjs/common';
import { RendezVousController } from './rendez-vous.controller';
import { RendezVousService } from './rendez-vous.service';

// Ce module regroupe les composants techniques et metier de base de rendez-vous.
@Module({
  controllers: [RendezVousController],
  providers: [RendezVousService],
})
export class RendezVousModule {}
