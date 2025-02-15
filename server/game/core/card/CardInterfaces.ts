import type { ZoneName } from '../Constants';
import type Player from '../Player';
import type { IBaseCard } from './BaseCard';
import type { IUnitCard } from './propertyMixins/UnitProperties';

export type IAttackableCard = IUnitCard | IBaseCard;

export interface ICardCanChangeControllers {
    takeControl(newController: Player, moveTo?: ZoneName.SpaceArena | ZoneName.GroundArena | ZoneName.Resource);
}
