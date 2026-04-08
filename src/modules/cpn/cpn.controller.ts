import { Controller, Get } from '@nestjs/common';
import { CpnService } from './cpn.service';

// Ce controleur expose un point d'entree minimal pour le module cpn.
@Controller('cpn')
export class CpnController {
  constructor(private readonly cpnService: CpnService) {}

  @Get()
  findAll() {
    return this.cpnService.findAll();
  }
}
