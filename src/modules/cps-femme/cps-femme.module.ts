import { Module } from '@nestjs/common';
import { CpsFemmeController } from './cps-femme.controller';
import { CpsFemmeService } from './cps-femme.service';

// Ce module regroupe les composants techniques et metier de base de cps-femme.
@Module({
  controllers: [CpsFemmeController],
  providers: [CpsFemmeService],
})
export class CpsFemmeModule {}
