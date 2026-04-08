import { Module } from '@nestjs/common';
import { ImpressionsController } from './impressions.controller';
import { ImpressionsService } from './impressions.service';

// Ce module regroupe les composants techniques et metier de base de impressions.
@Module({
  controllers: [ImpressionsController],
  providers: [ImpressionsService],
})
export class ImpressionsModule {}
