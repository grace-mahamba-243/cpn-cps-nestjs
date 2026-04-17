import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ExamenCpnEntity } from '../cpn/entities/examen-cpn.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { ContactCpnEntity } from '../cpn/entities/contact-cpn.entity';
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
  ) {}

  // --- Liste des demandes par statut ---

  // Seuls les examens biologiques passent par le laboratoire
  async listerDemandesEnAttente() {
    const examens = await this.examensRepo.find({
      where: { statut: 'DEMANDE', typeExamen: 'BIOLOGIQUE' },
      order: { creeLe: 'ASC' },
    });
    return { demandes: await this.enrichirExamens(examens) };
  }

  async listerDemandesEnCours() {
    const examens = await this.examensRepo.find({
      where: { statut: 'EN_COURS', typeExamen: 'BIOLOGIQUE' },
      order: { prisEnChargeLe: 'ASC' },
    });
    return { demandes: await this.enrichirExamens(examens) };
  }

  async listerHistorique() {
    const examens = await this.examensRepo.find({
      where: { statut: In(['RESULTAT_ENVOYE', 'RESULTAT_RECU']), typeExamen: 'BIOLOGIQUE' },
      order: { envoyeLe: 'DESC' },
    });
    return { demandes: await this.enrichirExamens(examens) };
  }

  async listerToutesDemandes(statut?: string) {
    const where: Record<string, unknown> = { typeExamen: 'BIOLOGIQUE' };
    if (statut) where.statut = statut;
    const examens = await this.examensRepo.find({
      where,
      order: { creeLe: 'DESC' },
    });
    return { demandes: await this.enrichirExamens(examens) };
  }

  // --- Detail d'une demande ---

  async obtenirDemande(examenId: string) {
    const examen = await this.examensRepo.findOne({ where: { id: examenId } });
    if (!examen) {
      throw new NotFoundException(`Demande d'examen #${examenId} introuvable.`);
    }
    return { demande: await this.enrichirExamen(examen) };
  }

  // --- Prise en charge ---

  async prendreEnCharge(examenId: string, dto: PriseEnChargeDto) {
    const examen = await this.examensRepo.findOne({ where: { id: examenId } });
    if (!examen) {
      throw new NotFoundException(`Demande d'examen #${examenId} introuvable.`);
    }
    if (examen.statut !== 'DEMANDE') {
      throw new BadRequestException(`Cette demande est deja en statut "${examen.statut}".`);
    }

    examen.statut = 'EN_COURS';
    examen.prisEnChargeLe = new Date();
    if (dto.notes) examen.notes = dto.notes;

    const enregistre = await this.examensRepo.save(examen);
    return {
      message: 'Demande prise en charge avec succes.',
      demande: await this.enrichirExamen(enregistre),
    };
  }

  // --- Saisie et envoi du resultat ---

  async saisirEtEnvoyerResultat(examenId: string, dto: SaisirResultatDto) {
    const examen = await this.examensRepo.findOne({ where: { id: examenId } });
    if (!examen) {
      throw new NotFoundException(`Demande d'examen #${examenId} introuvable.`);
    }
    if (!['DEMANDE', 'EN_COURS'].includes(examen.statut)) {
      throw new BadRequestException(`Le resultat ne peut pas etre saisi pour le statut "${examen.statut}".`);
    }
    if (!dto.resultat?.trim()) {
      throw new BadRequestException('Le resultat est obligatoire.');
    }

    examen.resultat = dto.resultat.trim();
    examen.dateExamen = dto.dateExamen ?? examen.dateExamen;
    examen.dateResultat = dto.dateResultat ?? new Date().toISOString().split('T')[0];
    if (dto.notes != null) examen.notes = dto.notes;
    // RESULTAT_RECU directement : le résultat est immédiatement visible côté clinique
    examen.statut = 'RESULTAT_RECU';
    examen.envoyeLe = new Date();
    if (!examen.prisEnChargeLe) examen.prisEnChargeLe = new Date();

    const enregistre = await this.examensRepo.save(examen);
    return {
      message: 'Resultat envoye au module clinique avec succes.',
      demande: await this.enrichirExamen(enregistre),
    };
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
}
