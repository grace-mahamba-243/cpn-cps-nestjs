/**
 * Tests unitaires du service d'authentification (AuthService).
 * Couvre : connexion réussie, identifiant incorrect, compte désactivé, déconnexion.
 */

import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { SessionAuthentificationEntity } from './entities/session-authentification.entity';
import { UtilisateurAuthEntity } from './entities/utilisateur-auth.entity';

// Fabrique de mock repositoire TypeORM
const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
  })),
});

describe('AuthService', () => {
  let service: AuthService;

  // Référence vers les méthodes mockées des repositories
  let utilisateursRepository: ReturnType<typeof mockRepository>;
  let sessionsRepository: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UtilisateurAuthEntity),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SessionAuthentificationEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    utilisateursRepository = module.get(getRepositoryToken(UtilisateurAuthEntity));
    sessionsRepository = module.get(getRepositoryToken(SessionAuthentificationEntity));
  });

  // ─────────────────────────────────────────────
  // TESTS — connexion()
  // ─────────────────────────────────────────────

  describe('connexion()', () => {
    it('TC-AUTH-01 : doit connecter un utilisateur avec des identifiants valides', async () => {
      const utilisateurMock = {
        id: 'uuid-test-001',
        identifiant: 'admin',
        nomAffichage: 'Super Administrateur',
        motDePasseHash: 'pass1234',
        actif: true,
        doitChangerMotDePasse: false,
        dernierAccesAt: null,
        role: { libelle: 'Super Administrateur', code: 'SUPER_ADMIN' },
      };

      const sessionMock = {
        id: 'session-uuid-001',
        jetonSession: 'jeton-test-abc123',
        expireLe: new Date(Date.now() + 30 * 60 * 1000),
        estActive: true,
        utilisateur: utilisateurMock,
      };

      utilisateursRepository.findOne.mockResolvedValue(utilisateurMock);
      sessionsRepository.create.mockReturnValue(sessionMock);
      sessionsRepository.save.mockResolvedValue(sessionMock);

      const resultat = await service.connexion({
        identifiant: 'admin',
        motDePasse: 'pass1234',
      });

      // La réponse retourne { utilisateur, session: { id, expiration }, expiration, message }
      expect(resultat).toHaveProperty('utilisateur');
      expect(resultat).toHaveProperty('session');
      expect(resultat).toHaveProperty('message');
      expect(resultat.utilisateur.identifiant).toBe('admin');
    });

    it('TC-AUTH-02 : doit rejeter un mot de passe incorrect avec UnauthorizedException', async () => {
      const utilisateurMock = {
        id: 'uuid-test-002',
        identifiant: 'infirmiere',
        motDePasseHash: 'bonmotdepasse',
        actif: true,
        role: { libelle: 'Infirmière', code: 'INFIRMIERE' },
      };

      utilisateursRepository.findOne.mockResolvedValue(utilisateurMock);

      await expect(
        service.connexion({ identifiant: 'infirmiere', motDePasse: 'mauvais' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("TC-AUTH-03 : doit rejeter si l'identifiant n'existe pas", async () => {
      utilisateursRepository.findOne.mockResolvedValue(null);

      await expect(
        service.connexion({ identifiant: 'inexistant', motDePasse: 'n importe' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('TC-AUTH-04 : doit rejeter un compte désactivé avec ForbiddenException', async () => {
      const utilisateurMock = {
        id: 'uuid-test-003',
        identifiant: 'laborantin',
        motDePasseHash: 'monpasse',
        actif: false, // compte désactivé
        role: { libelle: 'Laborantin', code: 'AGENT_LABORATOIRE' },
      };

      utilisateursRepository.findOne.mockResolvedValue(utilisateurMock);

      await expect(
        service.connexion({ identifiant: 'laborantin', motDePasse: 'monpasse' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─────────────────────────────────────────────
  // TESTS — deconnexion()
  // ─────────────────────────────────────────────

  describe('deconnexion()', () => {
    it("TC-AUTH-05 : doit lever NotFoundException si l'utilisateur est introuvable", async () => {
      utilisateursRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deconnexion({ identifiant: 'fantome', sessionId: undefined }),
      ).rejects.toThrow(NotFoundException);
    });

    it('TC-AUTH-06 : doit fermer les sessions actives pour un utilisateur connu', async () => {
      const utilisateurMock = {
        id: 'uuid-test-004',
        identifiant: 'medecin',
        actif: true,
      };

      utilisateursRepository.findOne.mockResolvedValue(utilisateurMock);

      // sessions retournées par le queryBuilder
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 'session-A', estActive: true },
          { id: 'session-B', estActive: true },
        ]),
      };
      sessionsRepository.createQueryBuilder.mockReturnValue(qb);
      sessionsRepository.save.mockResolvedValue({});

      const resultat = await service.deconnexion({
        identifiant: 'medecin',
        sessionId: undefined,
      });

      expect(resultat).toHaveProperty('message');
    });
  });
});
