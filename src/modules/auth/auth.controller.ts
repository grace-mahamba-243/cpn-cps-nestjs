import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangerMotDePasseDto } from './dto/changer-mot-de-passe.dto';
import { ConnexionDto } from './dto/connexion.dto';
import { DeconnexionDto } from './dto/deconnexion.dto';

// Ce controleur expose un point d'entree minimal pour le module auth.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Post('connexion')
  connexion(@Body() connexionDto: ConnexionDto) {
    return this.authService.connexion(connexionDto);
  }

  @Post('deconnexion')
  deconnexion(@Body() deconnexionDto: DeconnexionDto) {
    return this.authService.deconnexion(deconnexionDto);
  }

  @Post('changer-mot-de-passe')
  changerMotDePasse(@Body() changerMotDePasseDto: ChangerMotDePasseDto) {
    return this.authService.changerMotDePasse(changerMotDePasseDto);
  }

  @Get('profil/:identifiant')
  recupererProfil(@Param('identifiant') identifiant: string) {
    return this.authService.recupererProfil(identifiant);
  }

  @Get('tables')
  recupererTablesRequises() {
    return this.authService.recupererTablesRequises();
  }
}
