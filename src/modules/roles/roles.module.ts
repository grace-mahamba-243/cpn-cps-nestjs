import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../auth/entities/role.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

// Ce module regroupe les composants techniques et metier du module roles.
@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
