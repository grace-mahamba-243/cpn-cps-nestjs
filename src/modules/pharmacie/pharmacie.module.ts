import { Module } from '@nestjs/common';
import { PharmacieController } from './pharmacie.controller';
import { PharmacieService } from './pharmacie.service';

// Ce module regroupe les composants techniques et metier de base de pharmacie.
@Module({
  controllers: [PharmacieController],
  providers: [PharmacieService],
})
export class PharmacieModule {}
