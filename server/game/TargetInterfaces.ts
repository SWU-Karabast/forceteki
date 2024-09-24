import type { AbilityContext } from './core/ability/AbilityContext';
import type { TriggeredAbilityContext } from './core/ability/TriggeredAbilityContext';
import type { GameSystem } from './core/gameSystem/GameSystem';
import type { Card } from './core/card/Card';
import type CardAbility from './core/ability/CardAbility';
import type { RelativePlayer, TargetMode, CardType, Location, EventName, PhaseName, LocationFilter, WildcardCardType, CardTypeFilter } from './core/Constants';
import { MetaSystem } from './core/gameSystem/MetaSystem';

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/js/lines-around-comment: off */

// ********************************************** EXPORTED TYPES **********************************************
export type ITriggeredAbilityTargetResolver<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> =
    | (ICardTargetResolver<TContext> & ITriggeredAbilityCardTargetResolver<TContext>)
    | ISelectTargetResolver<TContext>;

export type ITriggeredAbilityTargetsResolver<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> = Record<string, ITriggeredAbilityTargetResolver<TContext> & ITriggeredAbilityTargetResolver<TContext>>;

export type IActionTargetResolver<TContext extends AbilityContext = AbilityContext> = (ICardTargetResolver<TContext> & IActionCardTargetResolver<TContext>) | ISelectTargetResolver<TContext> | IAbilityTargetResolver<TContext>;

export type IActionTargetsResolver<TContext extends AbilityContext = AbilityContext> = Record<string, IActionTargetResolver<TContext>>;

// ********************************************** INTERNAL TYPES **********************************************
type IChoicesInterface<TContext extends AbilityContext = AbilityContext> = Record<string, ((context: TContext) => boolean) | GameSystem | MetaSystem<TContext>>;

interface ITargetResolverBase<TContext extends AbilityContext> {
    activePromptTitle?: string;
    locationFilter?: LocationFilter | LocationFilter[];
    /** Filter cards by their controller */
    controller?: ((context: TContext) => RelativePlayer) | RelativePlayer;
    /** Selects which player is choosing the target (defaults to the player controlling the source card) */
    choosingPlayer?: ((context: TContext) => RelativePlayer) | RelativePlayer;
    hideIfNoLegalTargets?: boolean;
    immediateEffect?: GameSystem | MetaSystem<TContext>;
    dependsOn?: string;
}

interface ISelectTargetResolver<TContext extends AbilityContext> extends ITargetResolverBase<TContext> {
    mode: TargetMode.Select;
    choices: (IChoicesInterface | object) | ((context: TContext) => IChoicesInterface | object);
    condition?: (context: TContext) => boolean;
    checkTarget?: boolean;
}

interface IAbilityTargetResolver<TContext extends AbilityContext> extends ITargetResolverBase<TContext> {
    mode: TargetMode.Ability;
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    cardCondition?: (card: Card, context?: TContext) => boolean;
    abilityCondition?: (ability: CardAbility) => boolean;
}

interface ICardTargetResolverBase<TContext extends AbilityContext> extends ITargetResolverBase<TContext> {
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    locationFilter?: LocationFilter | LocationFilter[];
    optional?: boolean;
}

interface ICardExactlyUpToTargetResolver<TContext extends AbilityContext> extends ICardTargetResolverBase<TContext> {
    mode: TargetMode.Exactly | TargetMode.UpTo;
    numCards: number;
    sameDiscardPile?: boolean;
}

interface ICardExactlyUpToVariableTargetResolver<TContext extends AbilityContext> extends ICardTargetResolverBase<TContext> {
    mode: TargetMode.ExactlyVariable | TargetMode.UpToVariable;
    numCardsFunc: (context: TContext) => number;
}

interface ICardMaxStatTargetResolver<TContext extends AbilityContext> extends ICardTargetResolverBase<TContext> {
    mode: TargetMode.MaxStat;
    numCards: number;
    cardStat: (card: Card) => number;
    maxStat: () => number;
}

interface CardSingleUnlimitedTargetResolver<TContext extends AbilityContext> extends ICardTargetResolverBase<TContext> {
    mode?: TargetMode.Single | TargetMode.Unlimited;
}

type ICardTargetResolver<TContext extends AbilityContext> =
    | ICardExactlyUpToTargetResolver<TContext>
    | ICardExactlyUpToVariableTargetResolver<TContext>
    | ICardMaxStatTargetResolver<TContext>
    | CardSingleUnlimitedTargetResolver<TContext>
    | IAbilityTargetResolver<TContext>;

interface IActionCardTargetResolver<TContext extends AbilityContext> {
    cardCondition?: (card: Card, context?: TContext) => boolean;
}

interface ITriggeredAbilityCardTargetResolver<TContext extends AbilityContext> {
    cardCondition?: (card: Card, context?: TContext) => boolean;
}
