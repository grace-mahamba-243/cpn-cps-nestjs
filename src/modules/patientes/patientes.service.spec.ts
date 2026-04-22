/**
 * Tests unitaires — PatientesService
 * Couvre : liste, recherche, findOne, création, conflit numeroDossier.
 */

import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PatientesService } from './patientes.service';
import { PatienteEntity } from './entities/patiente.entity';
import { JournalService } from '../journal/journal.service';
import {
  mockRepository,
  MockRepository,
  mockJournalService,
  patienteFixture,
  patienteDeuxiemeFixture,
} from '../../test-utils';

describe('PatientesService', () => {
  let service: PatientesService;
  let patientesRepository: MockRepository<PatienteEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientesService,
        { provide: getRepositoryToken(PatienteEntity), useFactory: mockRepository },
        { provide: JournalService, useValue: mockJournalService },
      ],
    }).compile();

    service = module.get<PatientesService>(PatientesService);
    patientesRepository = module.get(getRepositoryToken(PatienteEntity));
  });

  afterEach(() => jest.clearAllMocks());

  // ─────────────────────────────────────────────
  // findAll()
  // ─────────────────────────────────────────────

  describe('findAll()', () => {
    it('TC-PAT-01 : doit retourner la liste de toutes les patientes sans filtre', async () => {
      patientesRepository.find.mockResolvedValue([patienteFixture, patienteDeuxiemeFixture]);

      const resultat = await service.findAll();

      expect(resultat).toHaveLength(2);
      expect(patientesRepository.find).toHaveBeenCalledWith({ order: { nom: 'ASC' } });
    });

    it('TC-PAT-02 : doit filtrer les patientes par terme de recherche', async () => {
      patientesRepository.find.mockResolvedValue([patienteFixture]);

      const resultat = await service.findAll('Furaha');

      expect(resultat).toHaveLength(1);
      expect(resultat[0].nom).toBe('Furaha');
    });

    it('TC-PAT-03 : doit retourner un tableau vide si aucune patiente ne correspond', async () => {
      patientesRepository.find.mockResolvedValue([]);

      const resultat = await service.findAll('Xyzabc');

      expect(resultat).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────────
  // findOne()
  // ─────────────────────────────────────────────

  describe('findOne()', () => {
    it("TC-PAT-04 : doit retourner la patiente correspondant à l'id", async () => {
      patientesRepository.findOne.mockResolvedValue(patienteFixture);

      const resultat = await service.findOne('patiente-uuid-001');

      expect(resultat.id).toBe('patiente-uuid-001');
      expect(resultat.nom).toBe('Furaha');
    });

    it('TC-PAT-05 : doit lever NotFoundException si la patiente est introuvable', async () => {
      patientesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('id-fantome')).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // findByNumeroDossier()
  // ─────────────────────────────────────────────

  describe('findByNumeroDossier()', () => {
    it('TC-PAT-06 : doit retourner la patiente correspondant au numéro de dossier', async () => {
      patientesRepository.findOne.mockResolvedValue(patienteFixture);

      const resultat = await service.findByNumeroDossier('AFIA-20260101-0001');

      expect(resultat).not.toBeNull();
      expect(resultat!.numeroDossier).toBe('AFIA-20260101-0001');
    });

    it('TC-PAT-07 : doit retourner null si le numéro de dossier est inexistant', async () => {
      patientesRepository.findOne.mockResolvedValue(null);

      const resultat = await service.findByNumeroDossier('AFIA-INEXISTANT');

      expect(resultat).toBeNull();
    });
  });

  // ─────────────────────────────────────────────
  // create() — enregistrement d'une nouvelle patiente
  // ─────────────────────────────────────────────

  describe('create()', () => {
    const dtoBase = {
      nom: 'Furaha',
      postnom: 'Amani',
      prenom: 'Marie',
      dateNaissance: '1995-03-15',
      telephone: '+243 990 000 001',
      adresse: 'Quartier Himbi, Goma',
      utilisateurNom: 'Amani Infirmière',
    };

    it('TC-PAT-08 : doit créer une nouvelle patiente avec un numéro de dossier généré', async () => {
      // Pas de doublon de téléphone
      patientesRepository.findOne.mockResolvedValue(null);
      // Génération du numéro : count = 0 → AFIA-2026-FU001
      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getOne: jest.fn().mockResolvedValue(null), // pas de doublon d'identité
      };
      patientesRepository.createQueryBuilder.mockReturnValue(qb);

      patientesRepository.create.mockReturnValue({ ...patienteFixture });
      patientesRepository.save.mockResolvedValue(patienteFixture);

      const resultat = await service.creer(dtoBase as any);

      expect(resultat).toHaveProperty('id');
      expect(patientesRepository.save).toHaveBeenCalledTimes(1);
    });

    it('TC-PAT-09 : doit rejeter si le numéro de téléphone est déjà utilisé — ConflictException', async () => {
      // findOne retourne une patiente existante avec ce téléphone
      patientesRepository.findOne.mockResolvedValue(patienteDeuxiemeFixture);

      await expect(service.creer(dtoBase as any)).rejects.toThrow(ConflictException);
    });
  });
});
