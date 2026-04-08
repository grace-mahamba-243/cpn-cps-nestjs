import { Controller, Get } from '@nestjs/common';
import { AccouchementsService } from './accouchements.service';

// Ce controleur expose un point d'entree minimal pour le module accouchements.
@Controller('accouchements')
export class AccouchementsController {
  constructor(private readonly accouchementsService: AccouchementsService) {}

  @Get()
  findAll() {
    return this.accouchementsService.findAll();
  }
}
