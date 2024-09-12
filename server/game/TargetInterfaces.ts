import type { AbilityContext } from './core/ability/AbilityContext';
import type { TriggeredAbilityContext } from './core/ability/TriggeredAbilityContext';
import type { GameSystem } from './core/gameSystem/GameSystem';
import type { Card } from './core/card/Card';
import type CardAbility from './core/ability/CardAbility';
import type { RelativePlayer, TargetMode, CardType, Location, EventName, PhaseName, LocationFilter, WildcardCardType, CardTypeFilter } from './core/Constants';

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/js/lines-around-comment: off */

// ********************************************** EXPORTED TYPES **********************************************
export type ITriggeredAbilityTargetResolver =
    | (ICardTargetResolver & ITriggeredAbilityCardTargetResolver)
    | ISelectTargetResolver;

export type ITriggeredAbilityTargetsResolver = Record<string, ITriggeredAbilityTargetResolver & ITriggeredAbilityTargetResolver>;

export type IActionTargetResolver = (ICardTargetResolver & IActionCardTargetResolver) | ISelectTargetResolver | IAbilityTargetResolver;

export type IActionTargetsResolver = Record<string, IActionTargetResolver>;

// ********************************************** INTERNAL TYPES **********************************************
type IChoicesInterface = Record<string, ((context: AbilityContext) => boolean) | GameSystem | GameSystem[]>;

interface ITargetResolverBase {
    activePromptTitle?: string;
    locationFilter?: LocationFilter | LocationFilter[];
    /** Filter cards by their controller */
    controller?: ((context: AbilityContext) => RelativePlayer) | RelativePlayer;
    /** Selects which player is choosing the target (defaults to the player controlling the source card) */
    choosingPlayer?: ((context: AbilityContext) => RelativePlayer) | RelativePlayer;
    hideIfNoLegalTargets?: boolean;
    immediateEffect?: GameSystem | GameSystem[];
    dependsOn?: string;
}

interface ISelectTargetResolver extends ITargetResolverBase {
    mode: TargetMode.Select;
    choices: (IChoicesInterface | object) | ((context: AbilityContext) => IChoicesInterface | object);
    condition?: (context: AbilityContext) => boolean;
    checkTarget?: boolean;
}

interface IAbilityTargetResolver extends ITargetResolverBase {
    mode: TargetMode.Ability;
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    cardCondition?: (card: Card, context?: AbilityContext) => boolean;
    abilityCondition?: (ability: CardAbility) => boolean;
}

interface ICardTargetResolverBase extends ITargetResolverBase {
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    locationFilter?: LocationFilter | LocationFilter[];
    optional?: boolean;
}

interface ICardExactlyUpToTargetResolver extends ICardTargetResolverBase {
    mode: TargetMode.Exactly | TargetMode.UpTo;
    numCards: number;
    sameDiscardPile?: boolean;
}

interface ICardExactlyUpToVariableTargetResolver extends ICardTargetResolverBase {
    mode: TargetMode.ExactlyVariable | TargetMode.UpToVariable;
    numCardsFunc: (context: AbilityContext) => number;
}

interface ICardMaxStatTargetResolver extends ICardTargetResolverBase {
    mode: TargetMode.MaxStat;
    numCards: number;
    cardStat: (card: Card) => number;
    maxStat: () => number;
}

interface CardSingleUnlimitedTargetResolver extends ICardTargetResolverBase {
    mode?: TargetMode.Single | TargetMode.Unlimited;
}

type ICardTargetResolver =
    | ICardExactlyUpToTargetResolver
    | ICardExactlyUpToVariableTargetResolver
    | ICardMaxStatTargetResolver
    | CardSingleUnlimitedTargetResolver
    | IAbilityTargetResolver;

interface IActionCardTargetResolver {
    cardCondition?: (card: Card, context?: AbilityContext) => boolean;
}

interface ITriggeredAbilityCardTargetResolver {
    cardCondition?: (card: Card, context?: TriggeredAbilityContext) => boolean;
}
