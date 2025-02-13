import type { IBaseCard } from './BaseCard';
import type { IUnitCard } from './propertyMixins/UnitProperties';

export type IAttackableCard = IUnitCard | IBaseCard;