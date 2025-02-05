import type { Attack } from './core/attack/Attack';
import type { Card } from './core/card/Card';
import type { UnitCard } from './core/card/CardTypes';
import type Player from './core/Player';

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/lines-around-comment: off */

// ********************************************** EXPORTED TYPES **********************************************
export type IDamageSource = IDamagedOrDefeatedByAttack | IDamagedOrDefeatedByAbility;
export type IDefeatSource = IDamagedOrDefeatedByAttack | IDamagedOrDefeatedByAbility | IDefeatedByUniqueRule | IDefeatedByFramework;

export enum DamageSourceType {
    Ability = 'ability',
    Attack = 'attack'
}

export enum DefeatSourceType {
    Ability = 'ability',
    Attack = 'attack',
    FrameworkEffect = 'frameworkEffect', // TODO: this is a workaround until we get the comp 3.0 rules
    UniqueRule = 'uniqueRule'
}

export interface IDamagedOrDefeatedByAttack extends IDamageOrDefeatSourceBase {
    type: DamageSourceType.Attack | DefeatSourceType.Attack;
    attack: Attack;
    damageDealtBy: UnitCard;
    isOverwhelmDamage: boolean;
    event: any;
}

export interface IDamagedOrDefeatedByAbility extends IDamageOrDefeatSourceBase {
    type: DamageSourceType.Ability | DefeatSourceType.Ability;
    card: Card;
    event: any;
}

export interface IDefeatedByUniqueRule extends IDamageOrDefeatSourceBase {
    type: DefeatSourceType.UniqueRule;
}

export interface IDefeatedByFramework extends IDamageOrDefeatSourceBase {
    type: DefeatSourceType.FrameworkEffect;
}

// ********************************************** INTERNAL TYPES **********************************************
interface IDamageOrDefeatSourceBase {
    /** The player that owns the effect causing the defeat / damage to this unit */
    player: Player;
    type: DamageSourceType | DefeatSourceType;
}
