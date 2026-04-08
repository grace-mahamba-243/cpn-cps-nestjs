import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

// Ce module regroupe les composants techniques et metier de base de roles.
@Module({
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
