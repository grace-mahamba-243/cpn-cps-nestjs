import { Module } from '@nestjs/common';
import { EnfantsController } from './enfants.controller';
import { EnfantsService } from './enfants.service';

// Ce module regroupe les composants techniques et metier de base de enfants.
@Module({
  controllers: [EnfantsController],
  providers: [EnfantsService],
})
export class EnfantsModule {}
