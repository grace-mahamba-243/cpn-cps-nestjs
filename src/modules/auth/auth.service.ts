import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { ConnexionDto } from './dto/connexion.dto';
import { DeconnexionDto } from './dto/deconnexion.dto';
import { SessionAuthentificationEntity } from './entities/session-authentification.entity';
import { UtilisateurAuthEntity } from './entities/utilisateur-auth.entity';

const DUREE_SESSION_MS = 30 * 60 * 1000;

// Ce service centralise la logique metier de base du module auth.
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UtilisateurAuthEntity)
    private readonly utilisateursRepository: Repository<UtilisateurAuthEntity>,
    @InjectRepository(SessionAuthentificationEntity)
    private readonly sessionsRepository: Repository<SessionAuthentificationEntity>,
  ) {}

  findAll() {
    return {
      module: 'auth',
      status: 'ready',
      mode: 'typeorm-mysql',
      message: 'Endpoints d authentification relies a MySQL via TypeORM.',
      endpoints: {
        connexion: 'POST /api/auth/connexion',
        deconnexion: 'POST /api/auth/deconnexion',
        profil: 'GET /api/auth/profil/:identifiant',
        tables: 'GET /api/auth/tables',
      },
    };
  }

  async connexion(connexionDto: ConnexionDto) {
    const identifiant = connexionDto.identifiant.trim().toLowerCase();
    const motDePasse = connexionDto.motDePasse.trim();
    const utilisateur = await this.trouverUtilisateur(identifiant);

    if (!utilisateur || utilisateur.motDePasseHash !== motDePasse) {
      throw new UnauthorizedException('Identifiant ou mot de passe invalide.');
    }

    if (!utilisateur.actif) {
      throw new ForbiddenException('Ce compte est desactive.');
    }

    return this.creerSession(utilisateur);
  }

  async deconnexion(deconnexionDto: DeconnexionDto) {
    const utilisateur = await this.trouverUtilisateur(
      deconnexionDto.identifiant.trim().toLowerCase(),
    );

    if (!utilisateur) {
      throw new NotFoundException('Utilisateur introuvable pour la deconnexion.');
    }

    const sessionsActives = await this.sessionsRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.utilisateur', 'utilisateur')
      .where('utilisateur.identifiant = :identifiant', {
        identifiant: utilisateur.identifiant,
      })
      .andWhere('session.estActive = :estActive', { estActive: true })
      .andWhere(
        deconnexionDto.sessionId ? 'session.id = :sessionId' : '1 = 1',
        deconnexionDto.sessionId ? { sessionId: deconnexionDto.sessionId } : {},
      )
      .getMany();

    if (deconnexionDto.sessionId && sessionsActives.length === 0) {
      throw new NotFoundException('Session introuvable pour la deconnexion.');
    }

    if (sessionsActives.length > 0) {
      const dateRevocation = new Date();

      for (const session of sessionsActives) {
        session.estActive = false;
        session.revoqueeLe = dateRevocation;
      }

      await this.sessionsRepository.save(sessionsActives);
    }

    return {
      message: 'Deconnexion prise en compte.',
      identifiant: utilisateur.identifiant,
      sessionId: deconnexionDto.sessionId ?? null,
      mode: 'typeorm-mysql',
    };
  }

  async recupererProfil(identifiant: string) {
    const utilisateur = await this.trouverUtilisateur(identifiant.trim().toLowerCase());

    if (!utilisateur) {
      throw new NotFoundException('Aucun profil ne correspond a cet identifiant.');
    }

    return this.formaterUtilisateur(utilisateur);
  }

  recupererTablesRequises() {
    return {
      module: 'auth',
      tables: [
        {
          nom: 'roles',
          colonnes: ['id', 'code', 'libelle'],
          usage: 'Reference les profils d acces disponibles dans le systeme.',
        },
        {
          nom: 'utilisateurs',
          colonnes: [
            'id',
            'identifiant',
            'nom_affichage',
            'mot_de_passe_hash',
            'actif',
            'role_id',
            'dernier_acces_at',
          ],
          usage: 'Stocke les comptes capables de se connecter a l application.',
        },
        {
          nom: 'sessions_authentification',
          colonnes: [
            'id',
            'utilisateur_id',
            'jeton_session',
            'expire_le',
            'est_active',
            'cree_le',
            'revoquee_le',
          ],
          usage: 'Trace les sessions ouvertes, leur expiration et leur revocation.',
        },
      ],
      note: 'Ces tables sont maintenant exploitees par le module auth via TypeORM et MySQL.',
    };
  }

  private trouverUtilisateur(identifiant: string) {
    return this.utilisateursRepository.findOne({
      where: { identifiant },
      relations: ['role'],
    });
  }

  private async creerSession(utilisateur: UtilisateurAuthEntity) {
    const expiration = Date.now() + DUREE_SESSION_MS;
    const session = this.sessionsRepository.create({
      utilisateur,
      jetonSession: randomUUID(),
      expireLe: new Date(expiration),
      estActive: true,
      revoqueeLe: null,
    });

    const sessionEnregistree = await this.sessionsRepository.save(session);

    await this.utilisateursRepository.update(utilisateur.id, {
      dernierAccesAt: new Date(),
    });

    return {
      utilisateur: this.formaterUtilisateur(utilisateur),
      session: {
        id: sessionEnregistree.id,
        expiration,
      },
      expiration,
      mode: 'typeorm-mysql',
      message: 'Connexion reussie.',
    };
  }

  private formaterUtilisateur(utilisateur: UtilisateurAuthEntity) {
    return {
      id: utilisateur.id,
      identifiant: utilisateur.identifiant,
      nomAffichage: utilisateur.nomAffichage,
      role: utilisateur.role.libelle,
      roleCode: utilisateur.role.code,
      actif: utilisateur.actif,
      dernierAccesAt: utilisateur.dernierAccesAt,
    };
  }
}
