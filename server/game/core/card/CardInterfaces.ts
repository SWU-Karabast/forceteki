import type { ZoneName } from '../Constants';
import type { Player } from '../Player';
import type { IBaseCard } from './BaseCard';
import type { IInPlayCard } from './baseClasses/InPlayCard';
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
    readonly printedUpgradeHp: number;
    readonly printedUpgradePower: number;
    getUpgradeHp(): number;
    getUpgradePower(): number;
}
