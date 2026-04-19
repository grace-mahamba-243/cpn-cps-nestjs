import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaccinationController } from './vaccination.controller';
import { VaccinationService } from './vaccination.service';
import { VaccinationDoseEntity } from './entities/vaccination-dose.entity';

// Ce module regroupe les composants du module vaccination enfant.
@Module({
  imports: [TypeOrmModule.forFeature([VaccinationDoseEntity])],
  controllers: [VaccinationController],
  providers: [VaccinationService],
  exports: [VaccinationService],
})
export class VaccinationModule {}
