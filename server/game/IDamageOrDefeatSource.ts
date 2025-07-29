import type { Attack } from './core/attack/Attack';
import type { Card } from './core/card/Card';
import type { IUnitCard } from './core/card/propertyMixins/UnitProperties';
import type { GameObjectBase, GameObjectRef } from './core/GameObjectBase';
import type { Player } from './core/Player';

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
    NonCombatDamage = 'nonCombatDamage',
    FrameworkEffect = 'frameworkEffect',
    UniqueRule = 'uniqueRule'
}

export enum ExhaustSourceType {
    Cost = 'cost',
    Ability = 'ability'
}

type GameObjectRefFieldConverter<Type> = Type extends (infer U)[]
    ? (U extends GameObjectBase ? GameObjectRef<U>[] : Type)
    : (Type extends GameObjectBase ? GameObjectRef<Type> : Type);

type GameObjectRefConverter<Type> = {
    [Property in keyof Type]: GameObjectRefFieldConverter<Type[Property]>;
};

export interface IDamagedOrDefeatedByAttack extends IDamageOrDefeatSourceBase {
    type: DamageSourceType.Attack | DefeatSourceType.Attack;
    attack: Attack;
    damageDealtBy: IUnitCard[];
    isOverwhelmDamage: boolean;
    event: any;
}

export interface IDamagedOrDefeatedByAbility extends IDamageOrDefeatSourceBase {
    type: DamageSourceType.Ability | DefeatSourceType.Ability | DefeatSourceType.NonCombatDamage;
    card: Card;
    // TODO: We should eventually make this non-optional when we can update all the
    //       existing code and guarantee that it's always set.
    /* The player controlling the card that caused the damage */
    controller?: Player;
    event: any;
}

export interface IDefeatedByUniqueRule extends IDamageOrDefeatSourceBase {
    type: DefeatSourceType.UniqueRule;
}

export interface IDefeatedByFramework extends IDamageOrDefeatSourceBase {
    type: DefeatSourceType.FrameworkEffect;
}

export interface IExhaustSource {
    player: Player;
    type: ExhaustSourceType;
}

// ********************************************** INTERNAL TYPES **********************************************
interface IDamageOrDefeatSourceBase {
    /** The player that owns the effect causing the defeat / damage to this unit */
    player: Player;
    type: DamageSourceType | DefeatSourceType;
}
