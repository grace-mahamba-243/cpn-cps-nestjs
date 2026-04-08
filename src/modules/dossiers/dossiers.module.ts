import { Module } from '@nestjs/common';
import { DossiersController } from './dossiers.controller';
import { DossiersService } from './dossiers.service';

// Ce module regroupe les composants techniques et metier de base de dossiers.
@Module({
  controllers: [DossiersController],
  providers: [DossiersService],
})
export class DossiersModule {}
