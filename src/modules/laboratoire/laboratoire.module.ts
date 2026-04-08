import { Module } from '@nestjs/common';
import { LaboratoireController } from './laboratoire.controller';
import { LaboratoireService } from './laboratoire.service';

// Ce module regroupe les composants techniques et metier de base de laboratoire.
@Module({
  controllers: [LaboratoireController],
  providers: [LaboratoireService],
})
export class LaboratoireModule {}
