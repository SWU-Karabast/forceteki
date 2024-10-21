import type { Attack } from './core/attack/Attack';
import type { Card } from './core/card/Card';
import type { UnitCard } from './core/card/CardTypes';
import type Player from './core/Player';
import type CardAbilityStep from './core/ability/CardAbilityStep';

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/lines-around-comment: off */

// ********************************************** EXPORTED TYPES **********************************************
export type IDamageOrDefeatSource = IDamagedOrDefeatedByAttack | IDamagedOrDefeatedByAbility;

/** Damage or defeat source that is not caused by a framework effect - e.g., Snoke hp effect */
export type INonFrameworkDamageOrDefeatSource = IDamagedOrDefeatedByAttack | IDamagedOrDefeatedByAbility;

export enum DamageOrDefeatSourceType {
    Ability = 'ability',
    Attack = 'attack'
}

export interface IDamagedOrDefeatedByAttack extends IDamageOrDefeatSourceBase {
    type: DamageOrDefeatSourceType.Attack;
    attack: Attack;
    damageDealtBy: UnitCard;
    isOverwhelmDamage: boolean;
}

export interface IDamagedOrDefeatedByAbility extends IDamageOrDefeatSourceBase {
    type: DamageOrDefeatSourceType.Ability;
    ability: CardAbilityStep;
    card: Card;
}

// ********************************************** INTERNAL TYPES **********************************************
interface IDamageOrDefeatSourceBase {
    /** The player that owns the effect causing the defeat / damage to this unit */
    player: Player;
    type: DamageOrDefeatSourceType;
}
