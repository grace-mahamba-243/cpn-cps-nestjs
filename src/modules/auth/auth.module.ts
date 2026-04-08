import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RoleEntity } from './entities/role.entity';
import { SessionAuthentificationEntity } from './entities/session-authentification.entity';
import { UtilisateurAuthEntity } from './entities/utilisateur-auth.entity';

// Ce module regroupe les composants techniques et metier de base de auth.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      UtilisateurAuthEntity,
      SessionAuthentificationEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
