import CardAbility from './core/ability/CardAbility';
import { Attack } from './core/attack/Attack';
import { Card } from './core/card/Card';
import { UnitCard } from './core/card/CardTypes';
import Player from './core/Player';

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/js/lines-around-comment: off */

// ********************************************** EXPORTED TYPES **********************************************

export interface IDamageOrDefeatSource {
    /** The player that owns the effect causing the defeat / damage to this unit */
    player: Player;
    details: IDamageOrDefeatDetails;
}

export enum DamageOrDefeatSourceType {
    Ability = 'ability',
    Attack = 'attack'
}

// ********************************************** INTERNAL TYPES **********************************************
interface IDamagedOrDefeatedByAttackDetails {
    type: DamageOrDefeatSourceType.Attack;
    attack: Attack;
    attacker: UnitCard;
}

interface IDamagedOrDefeatedByAbilityDetails {
    type: DamageOrDefeatSourceType.Ability;
    ability: CardAbility;
    card: Card;
}

type IDamageOrDefeatDetails = IDamagedOrDefeatedByAttackDetails | IDamagedOrDefeatedByAbilityDetails;
