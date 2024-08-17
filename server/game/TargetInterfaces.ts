import type { AbilityContext } from './core/ability/AbilityContext';
import type { TriggeredAbilityContext } from './core/ability/TriggeredAbilityContext';
import type { GameSystem } from './core/gameSystem/GameSystem';
import type Card from './core/card/Card';
import type CardAbility from './core/ability/CardAbility';
import type { RelativePlayer, TargetMode, CardType, Location, EventName, PhaseName, LocationFilter } from './core/Constants';

// ********************************************** EXPORTED TYPES **********************************************
export type ITriggeredAbilityTargetResolver =
    | (ICardTargetResolver & ITriggeredAbilityCardTargetResolver)
    | ISelectTargetResolver;

export type ITriggeredAbilityTargetsResolver = Record<string, ITriggeredAbilityTargetResolver & ISubTargetResolver & ITriggeredAbilityTargetResolver>;

export type IActionTargetResolver = (ICardTargetResolver & IActionCardTargetResolver) | ISelectTargetResolver | IAbilityTargetResolver;

export type IActionTargetsResolver = Record<string, IActionTargetResolver & ISubTargetResolver>;


// ********************************************** INTERNAL TYPES **********************************************
type IChoicesInterface = Record<string, ((context: AbilityContext) => boolean) | GameSystem | GameSystem[]>;

interface ITargetResolverBase {
    activePromptTitle?: string;
    locationFilter?: LocationFilter | LocationFilter[];
    controller?: ((context: AbilityContext) => RelativePlayer) | RelativePlayer;
    player?: ((context: AbilityContext) => RelativePlayer) | RelativePlayer;
    hideIfNoLegalTargets?: boolean;
    gameSystem?: GameSystem | GameSystem[];
}

interface ISelectTargetResolver extends ITargetResolverBase {
    mode: TargetMode.Select;
    choices: (IChoicesInterface | object) | ((context: AbilityContext) => IChoicesInterface | object);
    condition?: (context: AbilityContext) => boolean;
    targets?: boolean;
}

interface IAbilityTargetResolver extends ITargetResolverBase {
    mode: TargetMode.Ability;
    cardType?: CardType | CardType[];
    cardCondition?: (card: Card, context?: AbilityContext) => boolean;
    abilityCondition?: (ability: CardAbility) => boolean;
}

interface ICardTargetResolverBase extends ITargetResolverBase {
    cardType?: CardType | CardType[];
    locationFilter?: Location | Location[];
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

interface ISubTargetResolver {
    dependsOn?: string;
}

interface IActionCardTargetResolver {
    cardCondition?: (card: Card, context?: AbilityContext) => boolean;
}

interface ITriggeredAbilityCardTargetResolver {
    cardCondition?: (card: Card, context?: TriggeredAbilityContext) => boolean;
}
