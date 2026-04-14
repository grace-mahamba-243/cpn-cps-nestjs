// DTO representant le resume du jour fourni au tableau de bord de la reception.
export class ResumeTableauBordReceptionDto {
  // Nombre total de rendez-vous planifies pour aujourd hui
  rdvDuJour: number;

  // Nombre de patients deja arrives (statut ARRIVE ou TERMINE)
  arrivees: number;

  // Nombre de rendez-vous surprise enregistres aujourd hui
  surprises: number;

  // Liste compacte des rendez-vous du jour (planifies)
  rdvPlanifies: LigneRdvDto[];

  // Liste des rendez-vous surprise du jour
  rdvSurprise: LigneRdvDto[];
}

export class LigneRdvDto {
  id: string;
  nom: string;
  initiales: string;
  heure: string;
  motif: string;
  statut: string;
  typeRdv: string;
}
