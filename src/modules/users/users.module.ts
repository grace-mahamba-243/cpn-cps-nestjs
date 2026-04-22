import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../auth/entities/role.entity';
import { UtilisateurAuthEntity } from '../auth/entities/utilisateur-auth.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JournalModule } from '../journal/journal.module';

// Ce module regroupe les composants techniques et metier de base de users.
@Module({
  imports: [TypeOrmModule.forFeature([UtilisateurAuthEntity, RoleEntity]), JournalModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
