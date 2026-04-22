/**
 * Tests unitaires du service CPN (CpnService).
 * Couvre : ouverture d'un dossier CPN, modification d'un dossier, conflits et cas d'erreur.
 *
 * Le module OpenAI est mocké globalement pour éviter l'erreur
 * "Missing credentials" lors de l'instanciation du service.
 */

// Mock global du module openai — doit être AVANT tout import
// __esModule: true est requis pour que TypeScript/Jest reconnaisse le default export
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Analyse IA simulée.' } }],
        }),
      },
    },
  })),
}));

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CpnService } from './cpn.service';
import { DossierCpnEntity } from './entities/dossier-cpn.entity';
import { ContactCpnEntity } from './entities/contact-cpn.entity';
import { ExamenCpnEntity } from './entities/examen-cpn.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';
import { AccouchementEntity } from '../accouchements/entities/accouchement.entity';
import { RendezVousEntity } from '../rendez-vous/entities/rendez-vous.entity';
import { JournalService } from '../journal/journal.service';

// Fabrique de mock repositoire TypeORM
const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
  })),
  merge: jest.fn((entite, modifications) => Object.assign(entite, modifications)),
});

// Mock du JournalService
const mockJournalService = {
  enregistrer: jest.fn().mockResolvedValue(undefined),
};

describe('CpnService', () => {
  let service: CpnService;

  let dossiersRepo: ReturnType<typeof mockRepository>;
  let contactsRepo: ReturnType<typeof mockRepository>;
  let examensRepo: ReturnType<typeof mockRepository>;
  let patientesRepo: ReturnType<typeof mockRepository>;
  let accouchementsRepo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CpnService,
        { provide: getRepositoryToken(DossierCpnEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(ContactCpnEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(ExamenCpnEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(PatienteEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(AccouchementEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(RendezVousEntity), useFactory: mockRepository },
        { provide: JournalService, useValue: mockJournalService },
      ],
    }).compile();

    service = module.get<CpnService>(CpnService);
    dossiersRepo = module.get(getRepositoryToken(DossierCpnEntity));
    contactsRepo = module.get(getRepositoryToken(ContactCpnEntity));
    examensRepo = module.get(getRepositoryToken(ExamenCpnEntity));
    patientesRepo = module.get(getRepositoryToken(PatienteEntity));
    accouchementsRepo = module.get(getRepositoryToken(AccouchementEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // TESTS — ouvrirDossier()
  // ─────────────────────────────────────────────

  describe('ouvrirDossier()', () => {
    const patienteMock: Partial<PatienteEntity> = {
      id: 'patiente-uuid-001',
      nom: 'Amani',
      postnom: 'Furaha',
      numeroDossier: 'AFIA-20260101-0001',
    };

    const dtoCpnBase = {
      patienteId: 'patiente-uuid-001',
      dateOuverture: '2026-04-22',
      gestite: 2,
      parite: 1,
      nombreAvortements: 0,
    };

    it("TC-CPN-01 : doit ouvrir un dossier CPN pour une patiente existante sans dossier actif", async () => {
      patientesRepo.findOne.mockResolvedValue(patienteMock);
      dossiersRepo.findOne.mockResolvedValueOnce(null); // pas de dossier OUVERT
      // génération du numéro de dossier — count appelé dans genererNumeroDossierCpn
      dossiersRepo.count = jest.fn().mockResolvedValue(0);

      const dossierCree = {
        id: 'dossier-uuid-001',
        numeroDossierCpn: 'CPN-2026-0001',
        statut: 'OUVERT',
        patienteId: 'patiente-uuid-001',
        ...dtoCpnBase,
      };

      dossiersRepo.create.mockReturnValue(dossierCree);
      dossiersRepo.save.mockResolvedValue(dossierCree);
      dossiersRepo.findOne.mockResolvedValue({ ...dossierCree, patiente: patienteMock });

      const resultat = await service.ouvrirDossier(dtoCpnBase as any);

      expect(resultat).toHaveProperty('dossier');
      expect(resultat.dossier).toHaveProperty('numeroDossierCpn');
      expect(dossiersRepo.save).toHaveBeenCalledTimes(1);
    });

    it("TC-CPN-02 : doit ouvrir un dossier via le numéro de dossier mère (AFIA-...)", async () => {
      patientesRepo.findOne.mockResolvedValue(patienteMock);
      dossiersRepo.findOne.mockResolvedValueOnce(null);
      dossiersRepo.count = jest.fn().mockResolvedValue(3);

      const dossierCree = {
        id: 'dossier-uuid-002',
        numeroDossierCpn: 'CPN-2026-0004',
        statut: 'OUVERT',
        patienteId: 'patiente-uuid-001',
      };

      dossiersRepo.create.mockReturnValue(dossierCree);
      dossiersRepo.save.mockResolvedValue(dossierCree);
      dossiersRepo.findOne.mockResolvedValue({ ...dossierCree, patiente: patienteMock });

      const resultat = await service.ouvrirDossier({
        numeroDossierMere: 'AFIA-20260101-0001',
        dateOuverture: '2026-04-22',
        gestite: 1,
        parite: 0,
        nombreAvortements: 0,
      } as any);

      expect(resultat).toHaveProperty('dossier');
    });

    it("TC-CPN-03 : doit rejeter si la patiente est introuvable", async () => {
      patientesRepo.findOne.mockResolvedValue(null);

      await expect(
        service.ouvrirDossier(dtoCpnBase as any),
      ).rejects.toThrow(NotFoundException);
    });

    it("TC-CPN-04 : doit rejeter si un dossier CPN ouvert existe déjà pour cette patiente", async () => {
      patientesRepo.findOne.mockResolvedValue(patienteMock);
      // dossiersRepo.findOne retourne directement le dossier actif existant
      dossiersRepo.findOne.mockResolvedValue({ id: 'dossier-existant', statut: 'OUVERT' });

      await expect(
        service.ouvrirDossier(dtoCpnBase as any),
      ).rejects.toThrow(ConflictException);
    });

    it("TC-CPN-05 : doit rejeter si ni patienteId ni numeroDossierMere ne sont fournis", async () => {
      await expect(
        service.ouvrirDossier({
          dateOuverture: '2026-04-22',
          gestite: 1,
          parite: 0,
          nombreAvortements: 0,
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // TESTS — modifierDossier()
  // ─────────────────────────────────────────────

  describe('modifierDossier()', () => {
    const dossierMock = {
      id: 'dossier-uuid-003',
      numeroDossierCpn: 'CPN-2026-0002',
      statut: 'OUVERT',
      patienteId: 'patiente-uuid-001',
      gestite: 2,
      parite: 1,
      nombreAvortements: 0,
      vihStatut: 'INCONNU',
      patiente: { id: 'patiente-uuid-001', nom: 'Amani' },
      contacts: [],
      examens: [],
    };

    it("TC-CPN-06 : doit modifier les données obstétricales d'un dossier existant", async () => {
      dossiersRepo.findOne.mockResolvedValue({ ...dossierMock });
      dossiersRepo.merge.mockImplementation((entite: any, modifs: any) =>
        Object.assign(entite, modifs),
      );
      dossiersRepo.save.mockResolvedValue({ ...dossierMock, notes: 'Suivi normal' });

      const resultat = await service.modifierDossier('dossier-uuid-003', {
        notes: 'Suivi normal',
        utilisateurNom: 'Dr Mutombo',
      } as any);

      expect(resultat).toHaveProperty('message');
      expect(dossiersRepo.save).toHaveBeenCalledTimes(1);
    });

    it("TC-CPN-07 : doit rejeter la clôture manuelle (règle métier : seul un accouchement peut clôturer)", async () => {
      dossiersRepo.findOne.mockResolvedValue({ ...dossierMock });

      await expect(
        service.modifierDossier('dossier-uuid-003', {
          statut: 'CLOS',
          notesCloture: 'Accouchement à terme',
          closPar: 'Dr Mutombo',
          utilisateurNom: 'Dr Mutombo',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it("TC-CPN-08 : doit rejeter si le dossier à modifier est introuvable", async () => {
      dossiersRepo.findOne.mockResolvedValue(null);

      await expect(
        service.modifierDossier('dossier-inexistant', { notes: 'Test' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // TESTS — obtenirDossier()
  // ─────────────────────────────────────────────

  describe('obtenirDossier()', () => {
    it('TC-CPN-09 : doit retourner un dossier existant avec ses contacts et examens', async () => {
      const dossierMock = {
        id: 'dossier-uuid-004',
        numeroDossierCpn: 'CPN-2026-0003',
        statut: 'OUVERT',
        patiente: { id: 'patiente-uuid-001', nom: 'Furaha' },
        contacts: [{ id: 'contact-001', numeroContact: 1 }],
        examens: [],
      };

      dossiersRepo.findOne.mockResolvedValue(dossierMock);

      const resultat = await service.obtenirDossier('dossier-uuid-004');
      expect(resultat).toHaveProperty('dossier');
    });

    it('TC-CPN-10 : doit rejeter si le dossier est introuvable', async () => {
      dossiersRepo.findOne.mockResolvedValue(null);

      await expect(service.obtenirDossier('id-fantome')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
