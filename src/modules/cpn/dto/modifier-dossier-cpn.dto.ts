import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreerDossierCpnDto } from './creer-dossier-cpn.dto';

// Ce DTO valide les donnees pour modifier ou clore un dossier CPN.
export class ModifierDossierCpnDto extends PartialType(CreerDossierCpnDto) {
  @IsOptional()
  @IsIn(['OUVERT', 'CLOS'])
  statut?: string;
}
