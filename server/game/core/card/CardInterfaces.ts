import type { ZoneName } from '../Constants';
import type { Player } from '../Player';
import type { Card } from './Card';
import type { IBaseCard } from './BaseCard';
import type { IInPlayCard } from './baseClasses/InPlayCard';
import type { ICardWithCostProperty } from './propertyMixins/Cost';
import type { ICardWithPrintedHpProperty } from './propertyMixins/PrintedHp';
import type { ICardWithPrintedPowerProperty } from './propertyMixins/PrintedPower';
import type { IUnitCard } from './propertyMixins/UnitProperties';

export type IAttackableCard = IUnitCard | IBaseCard;

/**
 * A card that can have upgrades attached to it. Units are the default host; a base can host upgrades
 * that have the Fortify keyword. Both {@link IUnitCard} and {@link IBaseCard} implement this.
 *
 * NOTE: the attach/unattach params are intentionally untyped so that the shared attach machinery in
 * `InPlayCard` (which handles both upgrades and pilot units being attached) can pass itself through.
 */
export interface ICardWithUpgrades extends Card {
    readonly upgrades: IUpgradeCard[];
    attachUpgrade(upgrade);
    unattachUpgrade(upgrade, event?);
    isUpgraded(): boolean;
}

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
