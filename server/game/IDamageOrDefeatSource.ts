import CardAbility from './core/ability/CardAbility';
import { Attack } from './core/attack/Attack';
import { Card } from './core/card/Card';
import { CardWithDamageProperty, UnitCard } from './core/card/CardTypes';
import Player from './core/Player';

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/lines-around-comment: off */

// ********************************************** EXPORTED TYPES **********************************************
export type IDamageOrDefeatSource = IDamagedOrDefeatedByAttack | IDamagedOrDefeatedByAbility;

export enum DamageOrDefeatSourceType {
    Ability = 'ability',
    Attack = 'attack'
}

// ********************************************** INTERNAL TYPES **********************************************
interface IDamageOrDefeatSourceBase {
    /** The player that owns the effect causing the defeat / damage to this unit */
    player: Player;
    type: DamageOrDefeatSourceType;
}

interface IDamagedOrDefeatedByAttack extends IDamageOrDefeatSourceBase {
    type: DamageOrDefeatSourceType.Attack;
    attack: Attack;
    damageDealtBy: UnitCard;
}

interface IDamagedOrDefeatedByAbility extends IDamageOrDefeatSourceBase {
    type: DamageOrDefeatSourceType.Ability;
    ability: CardAbility;
    card: Card;
}
