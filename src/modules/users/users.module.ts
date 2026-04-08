import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Ce module regroupe les composants techniques et metier de base de users.
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
