import { Module } from '@nestjs/common';
import { GrossessesController } from './grossesses.controller';
import { GrossessesService } from './grossesses.service';

// Ce module regroupe les composants techniques et metier de base de grossesses.
@Module({
  controllers: [GrossessesController],
  providers: [GrossessesService],
})
export class GrossessesModule {}
