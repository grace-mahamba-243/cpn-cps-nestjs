import { Module } from '@nestjs/common';
import { AccouchementsController } from './accouchements.controller';
import { AccouchementsService } from './accouchements.service';

// Ce module regroupe les composants techniques et metier de base de accouchements.
@Module({
  controllers: [AccouchementsController],
  providers: [AccouchementsService],
})
export class AccouchementsModule {}
