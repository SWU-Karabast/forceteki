import type { AbilityContext } from './core/ability/AbilityContext';
import type { TriggeredAbilityContext } from './core/ability/TriggeredAbilityContext';
import type { GameSystem } from './core/gameSystem/GameSystem';
import type { Card } from './core/card/Card';
import type { CardTypeFilter, GameStateChangeRequired, RelativePlayer, RelativePlayerFilter, TargetMode, ZoneFilter } from './core/Constants';
import type { PlayerTargetSystem } from './core/gameSystem/PlayerTargetSystem';
import type { AggregateSystem } from './core/gameSystem/AggregateSystem';

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/lines-around-comment: off */

// ********************************************** EXPORTED TYPES **********************************************
export type ICardTargetResolver<TContext extends AbilityContext> =
  | ICardExactlyUpToTargetResolver<TContext>
  | ICardExactlyUpToVariableTargetResolver<TContext>
  | ICardBetweenVariableTargetResolver<TContext>
  | ICardMaxStatTargetResolver<TContext>
  | ICardSingleUnlimitedTargetResolver<TContext>;

export type IActionTargetResolver<TContext extends AbilityContext = AbilityContext> =
  | ICardTargetResolver<TContext>
  | ISelectTargetResolver<TContext>
  | IDropdownListTargetResolver<TContext>
  | IPlayerTargetResolver<TContext>;

export type ITriggeredAbilityTargetResolver<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> =
  | ICardTargetResolver<TContext>
  | ISelectTargetResolver<TContext>
  | IDropdownListTargetResolver<TContext>
  | IPlayerTargetResolver<TContext>;

export type ICardTargetsResolver<TContext extends AbilityContext> = ICardTargetResolver<TContext> & { optional?: boolean };

export type IActionTargetsResolverInner<TContext extends AbilityContext = AbilityContext> =
  | ICardTargetsResolver<TContext>
  | ISelectTargetResolver<TContext>
  | IDropdownListTargetResolver<TContext>
  | IPlayerTargetResolver<TContext>;

export type ITriggeredAbilityTargetsResolverInner<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> =
  | ICardTargetsResolver<TContext>
  | ISelectTargetResolver<TContext>
  | IDropdownListTargetResolver<TContext>
  | IPlayerTargetResolver<TContext>;

export type IActionTargetsResolver<TContext extends AbilityContext = AbilityContext> = Record<string, IActionTargetsResolverInner<TContext>>;

export type ITriggeredAbilityTargetsResolver<TContext extends TriggeredAbilityContext = TriggeredAbilityContext> = Record<string, ITriggeredAbilityTargetsResolverInner<TContext>>;

export interface ISelectTargetResolver<TContext extends AbilityContext> extends ITargetResolverBase<TContext> {
    mode: TargetMode.Select;
    choices: IChoicesInterface | ((context: TContext) => IChoicesInterface);
    condition?: (context: TContext) => boolean;
    checkTarget?: boolean;
    showUnresolvable?: boolean;
}

export interface IDropdownListTargetResolver<TContext extends AbilityContext> extends ITargetResolverBase<TContext> {
    mode: TargetMode.DropdownList;
    options: string[] | ((context: TContext) => string[]);
    condition?: (context: AbilityContext) => boolean;
    logSelection?: boolean;
}

export interface ITargetResolverBase<TContext extends AbilityContext> {
    activePromptTitle?: ((context: TContext) => string) | string;
    waitingPromptTitle?: string;
    appendToDefaultTitle?: string;

    // TODO: allow this be a concrete player object as well as a RelativePlayer enum
    /** Selects which player is choosing the target (defaults to the player controlling the source card) */
    choosingPlayer?: ((context: TContext) => RelativePlayer) | RelativePlayer;
    hideIfNoLegalTargets?: boolean;
    immediateEffect?: GameSystem<TContext>;
    dependsOn?: string;
    mustChangeGameState?: GameStateChangeRequired;
}

// TODO: add functionality to PlayerTargetResolver to autodetect any invalid target players.
export interface IPlayerTargetResolver<TContext extends AbilityContext> extends ITargetResolverBase<TContext> {
    mode: TargetMode.Player | TargetMode.MultiplePlayers;
    effectChoices?: (relativePlayer: RelativePlayer, context: TContext) => string;
    immediateEffect?: PlayerTargetSystem<TContext> | AggregateSystem<TContext>;
}

export type IChoicesInterface<TContext extends AbilityContext = AbilityContext> = Record<string, ((context: TContext) => boolean) | GameSystem<TContext>>;

// ********************************************** INTERNAL TYPES **********************************************
interface ICardTargetResolverBase<TContext extends AbilityContext> extends ITargetResolverBase<TContext> {
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    zoneFilter?: ZoneFilter | ZoneFilter[];
    cardCondition?: (card: Card, context?: TContext) => boolean;

    /** If zoneFilter includes ZoneName.Capture, use this to filter down to only the capture zones of specific units. Otherwise, all captured units in the arena will be targeted. */
    capturedByFilter?: Card | Card[] | ((context: TContext) => (Card | Card[]));

    /** Filter cards by their controller */
    controller?: ((context: TContext) => RelativePlayerFilter) | RelativePlayerFilter;
}

interface ICardExactlyUpToTargetResolver<TContext extends AbilityContext> extends ICardTargetResolverBase<TContext> {
    mode: TargetMode.Exactly | TargetMode.UpTo;
    canChooseNoCards?: boolean;
    numCards: number;
    multiSelectCardCondition?: (card: Card, selectedCards: Card[], context?: TContext) => boolean;
}

interface ICardExactlyUpToVariableTargetResolver<TContext extends AbilityContext> extends ICardTargetResolverBase<TContext> {
    mode: TargetMode.ExactlyVariable | TargetMode.UpToVariable;
    numCardsFunc: (context: TContext) => number;
    canChooseNoCards?: boolean;
    multiSelectCardCondition?: (card: Card, selectedCards: Card[], context?: TContext) => boolean;
}

interface ICardBetweenVariableTargetResolver<TContext extends AbilityContext> extends ICardTargetResolverBase<TContext> {
    mode: TargetMode.BetweenVariable;
    minNumCardsFunc: (context: TContext) => number;
    maxNumCardsFunc: (context: TContext) => number;
    useSingleSelectModeFunc?: (card: Card, selectedCards: Card[], context?: TContext) => boolean;
    multiSelectCardCondition?: (card: Card, selectedCards: Card[], context?: TContext) => boolean;
}

interface ICardMaxStatTargetResolver<TContext extends AbilityContext> extends ICardTargetResolverBase<TContext> {
    mode: TargetMode.MaxStat;
    numCards: number;
    cardStat: (card: Card) => number;
    maxStat: () => number;
    canChooseNoCards?: boolean;
}

interface ICardSingleUnlimitedTargetResolver<TContext extends AbilityContext> extends ICardTargetResolverBase<TContext> {
    mode?: TargetMode.Single | TargetMode.Unlimited;
    canChooseNoCards?: boolean;
    multiSelectCardCondition?: (card: Card, selectedCards: Card[], context?: TContext) => boolean;
}


