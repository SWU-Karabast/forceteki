import type { ZoneName } from '../Constants';
import type Player from '../Player';
import type { IBaseCard } from './BaseCard';
import type { IInPlayCard } from './baseClasses/InPlayCard';
import type { Card } from './Card';
import type { ICardWithCostProperty } from './propertyMixins/Cost';
import type { ICardWithPrintedHpProperty } from './propertyMixins/PrintedHp';
import type { ICardWithPrintedPowerProperty } from './propertyMixins/PrintedPower';
import type { IUnitCard } from './propertyMixins/UnitProperties';

export type IAttackableCard = IUnitCard | IBaseCard;

export interface ICardCanChangeControllers {
    takeControl(newController: Player, moveTo?: ZoneName.SpaceArena | ZoneName.GroundArena | ZoneName.Resource);
}

/** IUpgradeCard definition (exists here to prevent import loops) */
export interface IUpgradeCard extends IInPlayCard, ICardWithPrintedHpProperty, ICardWithPrintedPowerProperty, ICardWithCostProperty, ICardCanChangeControllers {
    get parentCard(): IUnitCard;
    attachTo(newParentCard: IUnitCard, newController?: Player);
    isAttached(): boolean;
    unattach();
    canAttach(targetCard: Card, controller?: Player): boolean;
}
