import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ExamenCpnEntity } from '../cpn/entities/examen-cpn.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { ContactCpnEntity } from '../cpn/entities/contact-cpn.entity';
import { ExamenEnfantEntity } from '../enfants/entities/examen-enfant.entity';
import { EnfantEntity } from '../enfants/entities/enfant.entity';
import { ExamenCpsFemmeEntity } from '../cps-femme/entities/examen-cps-femme.entity';
import { DossierCpsFemmeEntity } from '../cps-femme/entities/dossier-cps-femme.entity';
import { ExamenCpsEnfantEntity } from '../cps-enfant/entities/examen-cps-enfant.entity';
import { DossierCpsEnfantEntity } from '../cps-enfant/entities/dossier-cps-enfant.entity';
import { PriseEnChargeDto } from './dto/prise-en-charge.dto';
import { SaisirResultatDto } from './dto/saisir-resultat.dto';

// Ce service centralise la logique metier du module laboratoire.
@Injectable()
export class LaboratoireService {
  constructor(
    @InjectRepository(ExamenCpnEntity)
    private readonly examensRepo: Repository<ExamenCpnEntity>,
    @InjectRepository(DossierCpnEntity)
    private readonly dossiersRepo: Repository<DossierCpnEntity>,
    @InjectRepository(ContactCpnEntity)
    private readonly contactsRepo: Repository<ContactCpnEntity>,
    @InjectRepository(ExamenEnfantEntity)
    private readonly examensEnfantsRepo: Repository<ExamenEnfantEntity>,
    @InjectRepository(EnfantEntity)
    private readonly enfantsRepo: Repository<EnfantEntity>,
    @InjectRepository(ExamenCpsFemmeEntity)
    private readonly examensCpsFemmeRepo: Repository<ExamenCpsFemmeEntity>,
    @InjectRepository(DossierCpsFemmeEntity)
    private readonly dossiersCpsFemmeRepo: Repository<DossierCpsFemmeEntity>,
    @InjectRepository(ExamenCpsEnfantEntity)
    private readonly examensCpsEnfantRepo: Repository<ExamenCpsEnfantEntity>,
    @InjectRepository(DossierCpsEnfantEntity)
    private readonly dossiersCpsEnfantRepo: Repository<DossierCpsEnfantEntity>,
  ) {}

  // --- Liste des demandes par statut ---

  // Seuls les examens biologiques passent par le laboratoire
  async listerDemandesEnAttente() {
    const [cpn, enfants, cpsFemme, cpsEnfant] = await Promise.all([
      this.examensRepo.find({ where: { statut: 'DEMANDE', typeExamen: 'BIOLOGIQUE' }, order: { creeLe: 'ASC' } }),
      this.examensEnfantsRepo.find({ where: { statut: 'DEMANDE', typeExamen: 'BIOLOGIQUE' }, order: { creeLe: 'ASC' } }),
      this.examensCpsFemmeRepo.find({ where: { statut: 'DEMANDE', typeExamen: 'BIOLOGIQUE' }, order: { creeLe: 'ASC' } }),
      this.examensCpsEnfantRepo.find({ where: { statut: 'DEMANDE', typeExamen: 'BIOLOGIQUE' }, order: { creeLe: 'ASC' } }),
    ]);
    const demandes = [
      ...(await this.enrichirExamens(cpn)),
      ...(await this.enrichirExamensEnfants(enfants)),
      ...(await this.enrichirExamensCpsFemme(cpsFemme)),
      ...(await this.enrichirExamensCpsEnfant(cpsEnfant)),
    ].sort((a, b) => new Date(a.creeLe).getTime() - new Date(b.creeLe).getTime());
    return { demandes };
  }

  async listerDemandesEnCours() {
    const [cpn, enfants, cpsFemme, cpsEnfant] = await Promise.all([
      this.examensRepo.find({ where: { statut: 'EN_COURS', typeExamen: 'BIOLOGIQUE' }, order: { prisEnChargeLe: 'ASC' } }),
      this.examensEnfantsRepo.find({ where: { statut: 'EN_COURS', typeExamen: 'BIOLOGIQUE' }, order: { prisEnChargeLe: 'ASC' } }),
      this.examensCpsFemmeRepo.find({ where: { statut: 'EN_COURS', typeExamen: 'BIOLOGIQUE' }, order: { prisEnChargeLe: 'ASC' } }),
      this.examensCpsEnfantRepo.find({ where: { statut: 'EN_COURS', typeExamen: 'BIOLOGIQUE' }, order: { prisEnChargeLe: 'ASC' } }),
    ]);
    const demandes = [
      ...(await this.enrichirExamens(cpn)),
      ...(await this.enrichirExamensEnfants(enfants)),
      ...(await this.enrichirExamensCpsFemme(cpsFemme)),
      ...(await this.enrichirExamensCpsEnfant(cpsEnfant)),
    ];
    return { demandes };
  }

  async listerHistorique() {
    const [cpn, enfants] = await Promise.all([
      this.examensRepo.find({ where: { statut: In(['RESULTAT_ENVOYE', 'RESULTAT_RECU']), typeExamen: 'BIOLOGIQUE' }, order: { envoyeLe: 'DESC' } }),
      this.examensEnfantsRepo.find({ where: { statut: In(['RESULTAT_ENVOYE', 'RESULTAT_RECU']), typeExamen: 'BIOLOGIQUE' }, order: { envoyeLe: 'DESC' } }),
    ]);
    const demandes = [
      ...(await this.enrichirExamens(cpn)),
      ...(await this.enrichirExamensEnfants(enfants)),
    ].sort((a, b) => new Date(b.envoyeLe ?? b.creeLe).getTime() - new Date(a.envoyeLe ?? a.creeLe).getTime());
    return { demandes };
  }

  async listerHistoriqueAll() {
    const [cpn, enfants, cpsFemme, cpsEnfant] = await Promise.all([
      this.examensRepo.find({ where: { statut: In(['RESULTAT_ENVOYE', 'RESULTAT_RECU']), typeExamen: 'BIOLOGIQUE' }, order: { envoyeLe: 'DESC' } }),
      this.examensEnfantsRepo.find({ where: { statut: In(['RESULTAT_ENVOYE', 'RESULTAT_RECU']), typeExamen: 'BIOLOGIQUE' }, order: { envoyeLe: 'DESC' } }),
      this.examensCpsFemmeRepo.find({ where: { statut: In(['RESULTAT_ENVOYE', 'RESULTAT_RECU']), typeExamen: 'BIOLOGIQUE' }, order: { envoyeLe: 'DESC' } }),
      this.examensCpsEnfantRepo.find({ where: { statut: In(['RESULTAT_ENVOYE', 'RESULTAT_RECU']), typeExamen: 'BIOLOGIQUE' }, order: { envoyeLe: 'DESC' } }),
    ]);
    return [
      ...(await this.enrichirExamens(cpn)),
      ...(await this.enrichirExamensEnfants(enfants)),
      ...(await this.enrichirExamensCpsFemme(cpsFemme)),
      ...(await this.enrichirExamensCpsEnfant(cpsEnfant)),
    ].sort((a, b) => new Date(b.envoyeLe ?? b.creeLe).getTime() - new Date(a.envoyeLe ?? a.creeLe).getTime());
  }

  async listerToutesDemandes(statut?: string) {
    const where: Record<string, unknown> = { typeExamen: 'BIOLOGIQUE' };
    if (statut) where.statut = statut;
    const [cpn, enfants, cpsFemme, cpsEnfant] = await Promise.all([
      this.examensRepo.find({ where, order: { creeLe: 'DESC' } }),
      this.examensEnfantsRepo.find({ where, order: { creeLe: 'DESC' } }),
      this.examensCpsFemmeRepo.find({ where, order: { creeLe: 'DESC' } }),
      this.examensCpsEnfantRepo.find({ where, order: { creeLe: 'DESC' } }),
    ]);
    const demandes = [
      ...(await this.enrichirExamens(cpn)),
      ...(await this.enrichirExamensEnfants(enfants)),
      ...(await this.enrichirExamensCpsFemme(cpsFemme)),
      ...(await this.enrichirExamensCpsEnfant(cpsEnfant)),
    ].sort((a, b) => new Date(b.creeLe).getTime() - new Date(a.creeLe).getTime());
    return { demandes };
  }

  // --- Detail d'une demande ---

  async obtenirDemande(examenId: string) {
    // Chercher dans CPN, enfants, CPS Femme, CPS Enfant
    const examenCpn = await this.examensRepo.findOne({ where: { id: examenId } });
    if (examenCpn) return { demande: await this.enrichirExamen(examenCpn) };

    const examenEnfant = await this.examensEnfantsRepo.findOne({ where: { id: examenId } });
    if (examenEnfant) return { demande: await this.enrichirExamenEnfant(examenEnfant) };

    const examenCpsFemme = await this.examensCpsFemmeRepo.findOne({ where: { id: examenId } });
    if (examenCpsFemme) return { demande: await this.enrichirExamenCpsFemme(examenCpsFemme) };

    const examenCpsEnfant = await this.examensCpsEnfantRepo.findOne({ where: { id: examenId } });
    if (examenCpsEnfant) return { demande: await this.enrichirExamenCpsEnfant(examenCpsEnfant) };

    throw new NotFoundException(`Demande d'examen #${examenId} introuvable.`);
  }

  // --- Prise en charge ---

  async prendreEnCharge(examenId: string, dto: PriseEnChargeDto) {
    // Essayer CPN d'abord, puis enfants
    const examenCpn = await this.examensRepo.findOne({ where: { id: examenId } });
    if (examenCpn) {
      if (examenCpn.statut !== 'DEMANDE') {
        throw new BadRequestException(`Cette demande est deja en statut "${examenCpn.statut}".`);
      }
      examenCpn.statut = 'EN_COURS';
      examenCpn.prisEnChargeLe = new Date();
      if (dto.notes) examenCpn.notes = dto.notes;
      const enregistre = await this.examensRepo.save(examenCpn);
      return { message: 'Demande prise en charge avec succes.', demande: await this.enrichirExamen(enregistre) };
    }

    const examenEnfant = await this.examensEnfantsRepo.findOne({ where: { id: examenId } });
    if (examenEnfant) {
      if (examenEnfant.statut !== 'DEMANDE') {
        throw new BadRequestException(`Cette demande est deja en statut "${examenEnfant.statut}".`);
      }
      examenEnfant.statut = 'EN_COURS';
      examenEnfant.prisEnChargeLe = new Date();
      if (dto.notes) examenEnfant.notes = dto.notes;
      const enregistre = await this.examensEnfantsRepo.save(examenEnfant);
      return { message: 'Demande prise en charge avec succes.', demande: await this.enrichirExamenEnfant(enregistre) };
    }

    const examenCpsFemme = await this.examensCpsFemmeRepo.findOne({ where: { id: examenId } });
    if (examenCpsFemme) {
      if (examenCpsFemme.statut !== 'DEMANDE') {
        throw new BadRequestException(`Cette demande est deja en statut "${examenCpsFemme.statut}".`);
      }
      examenCpsFemme.statut = 'EN_COURS';
      examenCpsFemme.prisEnChargeLe = new Date();
      if (dto.notes) examenCpsFemme.notes = dto.notes;
      const enregistre = await this.examensCpsFemmeRepo.save(examenCpsFemme);
      return { message: 'Demande prise en charge avec succes.', demande: await this.enrichirExamenCpsFemme(enregistre) };
    }

    const examenCpsEnfant = await this.examensCpsEnfantRepo.findOne({ where: { id: examenId } });
    if (examenCpsEnfant) {
      if (examenCpsEnfant.statut !== 'DEMANDE') {
        throw new BadRequestException(`Cette demande est deja en statut "${examenCpsEnfant.statut}".`);
      }
      examenCpsEnfant.statut = 'EN_COURS';
      examenCpsEnfant.prisEnChargeLe = new Date();
      if (dto.notes) examenCpsEnfant.notes = dto.notes;
      const enregistre = await this.examensCpsEnfantRepo.save(examenCpsEnfant);
      return { message: 'Demande prise en charge avec succes.', demande: await this.enrichirExamenCpsEnfant(enregistre) };
    }

    throw new NotFoundException(`Demande d'examen #${examenId} introuvable.`);
  }

  // --- Saisie et envoi du resultat ---

  async saisirEtEnvoyerResultat(examenId: string, dto: SaisirResultatDto) {
    if (!dto.resultat?.trim()) {
      throw new BadRequestException('Le resultat est obligatoire.');
    }

    // Essayer CPN d'abord, puis enfants
    const examenCpn = await this.examensRepo.findOne({ where: { id: examenId } });
    if (examenCpn) {
      if (!['DEMANDE', 'EN_COURS'].includes(examenCpn.statut)) {
        throw new BadRequestException(`Le resultat ne peut pas etre saisi pour le statut "${examenCpn.statut}".`);
      }
      examenCpn.resultat = dto.resultat.trim();
      examenCpn.dateExamen = dto.dateExamen ?? examenCpn.dateExamen;
      examenCpn.dateResultat = dto.dateResultat ?? new Date().toISOString().split('T')[0];
      if (dto.notes != null) examenCpn.notes = dto.notes;
      examenCpn.statut = 'RESULTAT_RECU';
      examenCpn.envoyeLe = new Date();
      if (!examenCpn.prisEnChargeLe) examenCpn.prisEnChargeLe = new Date();
      const enregistre = await this.examensRepo.save(examenCpn);
      return { message: 'Resultat envoye au module clinique avec succes.', demande: await this.enrichirExamen(enregistre) };
    }

    const examenEnfant = await this.examensEnfantsRepo.findOne({ where: { id: examenId } });
    if (examenEnfant) {
      if (!['DEMANDE', 'EN_COURS'].includes(examenEnfant.statut)) {
        throw new BadRequestException(`Le resultat ne peut pas etre saisi pour le statut "${examenEnfant.statut}".`);
      }
      examenEnfant.resultat = dto.resultat.trim();
      examenEnfant.dateExamen = dto.dateExamen ?? examenEnfant.dateExamen;
      examenEnfant.dateResultat = dto.dateResultat ?? new Date().toISOString().split('T')[0];
      if (dto.notes != null) examenEnfant.notes = dto.notes;
      examenEnfant.statut = 'RESULTAT_RECU';
      examenEnfant.envoyeLe = new Date();
      if (!examenEnfant.prisEnChargeLe) examenEnfant.prisEnChargeLe = new Date();
      const enregistre = await this.examensEnfantsRepo.save(examenEnfant);
      return { message: 'Resultat envoye au module clinique avec succes.', demande: await this.enrichirExamenEnfant(enregistre) };
    }

    const examenCpsFemme = await this.examensCpsFemmeRepo.findOne({ where: { id: examenId } });
    if (examenCpsFemme) {
      if (!['DEMANDE', 'EN_COURS'].includes(examenCpsFemme.statut)) {
        throw new BadRequestException(`Le resultat ne peut pas etre saisi pour le statut "${examenCpsFemme.statut}".`);
      }
      examenCpsFemme.resultat = dto.resultat.trim();
      examenCpsFemme.dateExamen = dto.dateExamen ?? examenCpsFemme.dateExamen;
      examenCpsFemme.dateResultat = dto.dateResultat ?? new Date().toISOString().split('T')[0];
      if (dto.notes != null) examenCpsFemme.notes = dto.notes;
      examenCpsFemme.statut = 'RESULTAT_RECU';
      examenCpsFemme.envoyeLe = new Date();
      if (!examenCpsFemme.prisEnChargeLe) examenCpsFemme.prisEnChargeLe = new Date();
      const enregistre = await this.examensCpsFemmeRepo.save(examenCpsFemme);
      return { message: 'Resultat envoye au module clinique avec succes.', demande: await this.enrichirExamenCpsFemme(enregistre) };
    }

    const examenCpsEnfant = await this.examensCpsEnfantRepo.findOne({ where: { id: examenId } });
    if (examenCpsEnfant) {
      if (!['DEMANDE', 'EN_COURS'].includes(examenCpsEnfant.statut)) {
        throw new BadRequestException(`Le resultat ne peut pas etre saisi pour le statut "${examenCpsEnfant.statut}".`);
      }
      examenCpsEnfant.resultat = dto.resultat.trim();
      examenCpsEnfant.dateExamen = dto.dateExamen ?? examenCpsEnfant.dateExamen;
      examenCpsEnfant.dateResultat = dto.dateResultat ?? new Date().toISOString().split('T')[0];
      if (dto.notes != null) examenCpsEnfant.notes = dto.notes;
      examenCpsEnfant.statut = 'RESULTAT_RECU';
      examenCpsEnfant.envoyeLe = new Date();
      if (!examenCpsEnfant.prisEnChargeLe) examenCpsEnfant.prisEnChargeLe = new Date();
      const enregistre = await this.examensCpsEnfantRepo.save(examenCpsEnfant);
      return { message: 'Resultat envoye au module clinique avec succes.', demande: await this.enrichirExamenCpsEnfant(enregistre) };
    }

    throw new NotFoundException(`Demande d'examen #${examenId} introuvable.`);
  }

  // --- Helpers ---

  private async enrichirExamen(examen: ExamenCpnEntity) {
    const dossier = await this.dossiersRepo.findOne({
      where: { id: examen.dossierCpnId },
      relations: ['patiente'],
    });

    let contact: ContactCpnEntity | null = null;
    if (examen.contactCpnId) {
      contact = await this.contactsRepo.findOne({ where: { id: examen.contactCpnId } });
    }

    return {
      id: examen.id,
      module: 'CPN',
      typeExamen: examen.typeExamen,
      libelle: examen.libelle,
      statut: examen.statut,
      source: examen.source,
      resultat: examen.resultat,
      dateExamen: examen.dateExamen,
      dateResultat: examen.dateResultat,
      notes: examen.notes,
      creeLe: examen.creeLe,
      prisEnChargeLe: examen.prisEnChargeLe,
      envoyeLe: examen.envoyeLe,
      dossierCpnId: examen.dossierCpnId,
      contactCpnId: examen.contactCpnId,
      numeroContact: contact?.numeroContact ?? null,
      dateContact: contact?.dateContact ?? null,
      patiente: dossier?.patiente
        ? {
            id: dossier.patiente.id,
            nom: [dossier.patiente.nom, dossier.patiente.postnom, dossier.patiente.prenom]
              .filter(Boolean)
              .join(' '),
            telephone: dossier.patiente.telephone,
            numeroDossier: dossier.patiente.numeroDossier,
          }
        : null,
      numeroDossierCpn: dossier?.numeroDossierCpn ?? null,
    };
  }

  private async enrichirExamens(examens: ExamenCpnEntity[]) {
    return Promise.all(examens.map((e) => this.enrichirExamen(e)));
  }

  // --- Helpers enrichissement examens enfants ---

  private async enrichirExamenEnfant(examen: ExamenEnfantEntity) {
    const enfant = await this.enfantsRepo.findOne({ where: { id: examen.enfantId } });

    return {
      id: examen.id,
      module: 'ENFANT',
      typeExamen: examen.typeExamen,
      libelle: examen.libelle,
      statut: examen.statut,
      source: examen.source,
      resultat: examen.resultat,
      dateExamen: examen.dateExamen,
      dateResultat: examen.dateResultat,
      notes: examen.notes,
      creeLe: examen.creeLe,
      prisEnChargeLe: examen.prisEnChargeLe,
      envoyeLe: examen.envoyeLe,
      enfantId: examen.enfantId,
      suiviEnfantId: examen.suiviEnfantId,
      numeroDossier: enfant?.numeroDossier ?? null,
      patiente: enfant
        ? {
            id: enfant.id,
            nom: [enfant.nom, enfant.postnom, enfant.prenom].filter(Boolean).join(' '),
            telephone: enfant.telephone,
            numeroDossier: enfant.numeroDossier,
          }
        : null,
      numeroDossierCpn: null,
    };
  }

  private async enrichirExamensEnfants(examens: ExamenEnfantEntity[]) {
    return Promise.all(examens.map((e) => this.enrichirExamenEnfant(e)));
  }

  // --- Helpers enrichissement examens CPS Femme ---

  private async enrichirExamenCpsFemme(examen: ExamenCpsFemmeEntity) {
    const dossier = await this.dossiersCpsFemmeRepo.findOne({
      where: { id: examen.dossierId },
      relations: ['patiente'],
    });
    return {
      id: examen.id,
      module: 'CPS_FEMME',
      typeExamen: examen.typeExamen,
      libelle: examen.libelle,
      statut: examen.statut,
      source: examen.source,
      resultat: examen.resultat,
      dateExamen: examen.dateExamen,
      dateResultat: examen.dateResultat,
      notes: examen.notes,
      creeLe: examen.creeLe,
      prisEnChargeLe: examen.prisEnChargeLe,
      envoyeLe: examen.envoyeLe,
      dossierId: examen.dossierId,
      patiente: dossier?.patiente
        ? {
            id: dossier.patiente.id,
            nom: [dossier.patiente.nom, dossier.patiente.postnom, dossier.patiente.prenom].filter(Boolean).join(' '),
            telephone: dossier.patiente.telephone,
            numeroDossier: dossier.patiente.numeroDossier,
          }
        : null,
      numeroDossierCpn: null,
    };
  }

  private async enrichirExamensCpsFemme(examens: ExamenCpsFemmeEntity[]) {
    return Promise.all(examens.map((e) => this.enrichirExamenCpsFemme(e)));
  }

  // --- Helpers enrichissement examens CPS Enfant ---

  private async enrichirExamenCpsEnfant(examen: ExamenCpsEnfantEntity) {
    const dossier = await this.dossiersCpsEnfantRepo.findOne({
      where: { id: examen.dossierId },
      relations: ['enfant'],
    });
    const enfant = dossier?.enfant ?? null;
    return {
      id: examen.id,
      module: 'CPS_ENFANT',
      typeExamen: examen.typeExamen,
      libelle: examen.libelle,
      statut: examen.statut,
      source: examen.source,
      resultat: examen.resultat,
      dateExamen: examen.dateExamen,
      dateResultat: examen.dateResultat,
      notes: examen.notes,
      creeLe: examen.creeLe,
      prisEnChargeLe: examen.prisEnChargeLe,
      envoyeLe: examen.envoyeLe,
      dossierId: examen.dossierId,
      patiente: enfant
        ? {
            id: enfant.id,
            nom: [enfant.nom, enfant.postnom, enfant.prenom].filter(Boolean).join(' '),
            telephone: enfant.telephone,
            numeroDossier: enfant.numeroDossier,
          }
        : null,
      numeroDossierCpn: null,
    };
  }

  private async enrichirExamensCpsEnfant(examens: ExamenCpsEnfantEntity[]) {
    return Promise.all(examens.map((e) => this.enrichirExamenCpsEnfant(e)));
  }
}
