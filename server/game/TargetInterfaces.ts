import type { AbilityContext } from './core/ability/AbilityContext';
import type { TriggeredAbilityContext } from './core/ability/TriggeredAbilityContext';
import type { GameSystem } from './core/gameSystem/GameSystem';
import type { Card } from './core/card/Card';
import { RelativePlayer, TargetMode, ZoneFilter, CardTypeFilter, RelativePlayerFilter } from './core/Constants';
import { PlayerTargetSystem } from './core/gameSystem/PlayerTargetSystem';

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/lines-around-comment: off */

// ********************************************** EXPORTED TYPES **********************************************
export type ITriggeredAbilityTargetResolver<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> =
  | ICardTargetResolver<TContext>
  | ISelectTargetResolver<TContext>
  | IDropdownListTargetResolver<TContext>
  | IPlayerTargetResolver<TContext>;

export type ITriggeredAbilityTargetsResolver<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> = Record<string, ITriggeredAbilityTargetResolver<TContext> & ITriggeredAbilityTargetResolver<TContext>>;

export type IActionTargetResolver<TContext extends AbilityContext = AbilityContext> =
  | ICardTargetResolver<TContext>
  | ISelectTargetResolver<TContext>
  | IDropdownListTargetResolver<TContext>
  | IPlayerTargetResolver<TContext>;

export type IActionTargetsResolver<TContext extends AbilityContext = AbilityContext> = Record<string, IActionTargetResolver<TContext>>;

export type ICardTargetResolver<TContext extends AbilityContext> =
  | ICardExactlyUpToTargetResolver<TContext>
  | ICardExactlyUpToVariableTargetResolver<TContext>
  | ICardMaxStatTargetResolver<TContext>
  | CardSingleUnlimitedTargetResolver<TContext>;

export interface ISelectTargetResolver<TContext extends AbilityContext> extends ITargetResolverBase<TContext> {
    mode: TargetMode.Select;
    choices: IChoicesInterface | ((context: TContext) => IChoicesInterface);
    condition?: (context: TContext) => boolean;
    checkTarget?: boolean;
}

export interface IDropdownListTargetResolver<TContext extends AbilityContext> extends ITargetResolverBase<TContext> {
    mode: TargetMode.DropdownList;
    options: string[];
    condition?: (context: AbilityContext) => boolean;
}

export interface ITargetResolverBase<TContext extends AbilityContext> {
    activePromptTitle?: string;
    zoneFilter?: ZoneFilter | ZoneFilter[];

    /** If provided, every listed unit will have its capture zone included for targeting. To target only capture zones, set `zoneFilter = []` */
    unitsCapturedBy?: Card | Card[] | ((context: TContext) => (Card | Card[]));

    /** Filter cards by their controller */
    controller?: ((context: TContext) => RelativePlayerFilter) | RelativePlayerFilter;

    // TODO: allow this be a concrete player object as well as a RelativePlayer enum
    /** Selects which player is choosing the target (defaults to the player controlling the source card) */
    choosingPlayer?: ((context: TContext) => RelativePlayer) | RelativePlayer;
    hideIfNoLegalTargets?: boolean;
    immediateEffect?: GameSystem<TContext>;
    dependsOn?: string;
    mustChangeGameState?: boolean;
}

// TODO: add functionality to PlayerTargetResolver to autodetect any invalid target players.
export interface IPlayerTargetResolver<TContext extends AbilityContext> extends ITargetResolverBase<TContext> {
    mode: TargetMode.Player | TargetMode.MultiplePlayers;
    immediateEffect?: PlayerTargetSystem<TContext>;
}

export type IChoicesInterface<TContext extends AbilityContext = AbilityContext> = Record<string, ((context: TContext) => boolean) | GameSystem<TContext>>;

// ********************************************** INTERNAL TYPES **********************************************
interface ICardTargetResolverBase<TContext extends AbilityContext> extends ITargetResolverBase<TContext> {
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    zoneFilter?: ZoneFilter | ZoneFilter[];
    optional?: boolean;
    cardCondition?: (card: Card, context?: TContext) => boolean;
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
