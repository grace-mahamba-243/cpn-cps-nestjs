import { Module } from '@nestjs/common';
import { CpnController } from './cpn.controller';
import { CpnService } from './cpn.service';

// Ce module regroupe les composants techniques et metier de base de cpn.
@Module({
  controllers: [CpnController],
  providers: [CpnService],
})
export class CpnModule {}
