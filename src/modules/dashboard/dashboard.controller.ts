import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

// Ce controleur expose un point d'entree minimal pour le module dashboard.
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  findAll() {
    return this.dashboardService.findAll();
  }
}
