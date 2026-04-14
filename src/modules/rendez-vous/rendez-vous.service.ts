import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RendezVousEntity } from './entities/rendez-vous.entity';
import { ResumeTableauBordReceptionDto } from './dto/resume-tableau-bord-reception.dto';

// Ce service centralise la logique metier du module rendez-vous.
// Il expose le resume du jour utilise par le tableau de bord de la reception.
@Injectable()
export class RendezVousService {
  constructor(
    @InjectRepository(RendezVousEntity)
    private readonly rendezVousRepository: Repository<RendezVousEntity>,
  ) {}

  findAll() {
    return {
      module: 'rendez-vous',
      status: 'ready',
      message: 'Socle backend initialise pour le module rendez-vous.',
    };
  }

  // Retourne le resume du jour pour le tableau de bord de la reception.
  // Les donnees simulees sont retournees jusqu a ce que la base soit populee.
  async getResumeDuJour(): Promise<ResumeTableauBordReceptionDto> {
    const dateAujourdhui = new Date().toISOString().split('T')[0];

    const [rdvPlanifies, rdvSurprise] = await Promise.all([
      this.rendezVousRepository.find({
        where: { dateRdv: dateAujourdhui, typeRdv: 'PROGRAMME' },
        order: { heureRdv: 'ASC' },
      }),
      this.rendezVousRepository.find({
        where: { dateRdv: dateAujourdhui, typeRdv: 'SURPRISE' },
        order: { heureRdv: 'ASC' },
      }),
    ]);

    const arrivees = rdvPlanifies.filter(
      (rdv) => rdv.statut === 'ARRIVE' || rdv.statut === 'TERMINE',
    ).length;

    const formater = (rdv: RendezVousEntity) => ({
      id: rdv.id,
      nom: rdv.nomPatient,
      initiales: rdv.initialesPatient,
      heure: rdv.heureRdv,
      motif: rdv.motif,
      statut: rdv.statut,
      typeRdv: rdv.typeRdv,
    });

    return {
      rdvDuJour: rdvPlanifies.length,
      arrivees,
      surprises: rdvSurprise.length,
      rdvPlanifies: rdvPlanifies.map(formater),
      rdvSurprise: rdvSurprise.map(formater),
    };
  }
}
