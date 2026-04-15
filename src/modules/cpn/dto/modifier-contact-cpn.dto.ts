import { PartialType } from '@nestjs/mapped-types';
import { CreerContactCpnDto } from './creer-contact-cpn.dto';

// Ce DTO valide les donnees pour modifier un contact CPN existant.
export class ModifierContactCpnDto extends PartialType(CreerContactCpnDto) {}
