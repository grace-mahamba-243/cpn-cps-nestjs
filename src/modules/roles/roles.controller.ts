import { Controller, Get } from '@nestjs/common';
import { RolesService } from './roles.service';

// Ce controleur expose un point d'entree minimal pour le module roles.
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }
}
