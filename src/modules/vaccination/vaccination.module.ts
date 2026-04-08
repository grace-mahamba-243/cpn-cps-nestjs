import { Module } from '@nestjs/common';
import { VaccinationController } from './vaccination.controller';
import { VaccinationService } from './vaccination.service';

// Ce module regroupe les composants techniques et metier de base de vaccination.
@Module({
  controllers: [VaccinationController],
  providers: [VaccinationService],
})
export class VaccinationModule {}
