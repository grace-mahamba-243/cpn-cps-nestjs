import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

// Ce controleur expose un point d'entree minimal pour le module users.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
