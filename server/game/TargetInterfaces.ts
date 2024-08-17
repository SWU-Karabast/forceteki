import type { AbilityContext } from './core/ability/AbilityContext';
import type { TriggeredAbilityContext } from './core/ability/TriggeredAbilityContext';
import type { GameSystem } from './core/gameSystem/GameSystem';
import type Card from './core/card/Card';
import type CardAbility from './core/ability/CardAbility';
import type { IAttackProperties } from './gameSystems/AttackSystem';
import type { RelativePlayer, TargetMode, CardType, Location, EventName, PhaseName, LocationFilter } from './core/Constants';
import type { IInitiateAttack, EffectArg } from './Interfaces';

// ********************************************** EXPORTED TYPES **********************************************
export type ITriggeredAbilityTarget =
    | (ITargetCard & ITriggeredAbilityCardTarget)
    | ITargetSelect;

export type ITriggeredAbilityTargets = Record<string, ITriggeredAbilityTarget & ISubTarget & ITriggeredAbilityTarget>;

export type IActionTarget = (ITargetCard & IActionCardTarget) | ITargetSelect | ITargetAbility;

export type IActionTargets = Record<string, IActionTarget & ISubTarget>;


// ********************************************** INTERNAL TYPES **********************************************
type IChoicesInterface = Record<string, ((context: AbilityContext) => boolean) | GameSystem | GameSystem[]>;

interface IBaseTarget {
    activePromptTitle?: string;
    locationFilter?: LocationFilter | LocationFilter[];
    controller?: ((context: AbilityContext) => RelativePlayer) | RelativePlayer;
    player?: ((context: AbilityContext) => RelativePlayer) | RelativePlayer;
    hideIfNoLegalTargets?: boolean;
    gameSystem?: GameSystem | GameSystem[];
}

interface ITargetSelect extends IBaseTarget {
    mode: TargetMode.Select;
    choices: (IChoicesInterface | object) | ((context: AbilityContext) => IChoicesInterface | object);
    condition?: (context: AbilityContext) => boolean;
    targets?: boolean;
}

interface ITargetAbility extends IBaseTarget {
    mode: TargetMode.Ability;
    cardType?: CardType | CardType[];
    cardCondition?: (card: Card, context?: AbilityContext) => boolean;
    abilityCondition?: (ability: CardAbility) => boolean;
}

interface IBaseTargetCard extends IBaseTarget {
    cardType?: CardType | CardType[];
    locationFilter?: Location | Location[];
    optional?: boolean;
}

interface ITargetCardExactlyUpTo extends IBaseTargetCard {
    mode: TargetMode.Exactly | TargetMode.UpTo;
    numCards: number;
    sameDiscardPile?: boolean;
}

interface ITargetCardExactlyUpToVariable extends IBaseTargetCard {
    mode: TargetMode.ExactlyVariable | TargetMode.UpToVariable;
    numCardsFunc: (context: AbilityContext) => number;
}

interface ITargetCardMaxStat extends IBaseTargetCard {
    mode: TargetMode.MaxStat;
    numCards: number;
    cardStat: (card: Card) => number;
    maxStat: () => number;
}

interface TargetCardSingleUnlimited extends IBaseTargetCard {
    mode?: TargetMode.Single | TargetMode.Unlimited;
}

type ITargetCard =
    | ITargetCardExactlyUpTo
    | ITargetCardExactlyUpToVariable
    | ITargetCardMaxStat
    | TargetCardSingleUnlimited
    | ITargetAbility;

interface ISubTarget {
    dependsOn?: string;
}

interface IActionCardTarget {
    cardCondition?: (card: Card, context?: AbilityContext) => boolean;
}

interface IAbilityProps<Context> {
    title: string;
    locationFilter?: Location | Location[];
    cost?: any;
    limit?: any;
    max?: any;
    target?: IActionTarget;
    targets?: IActionTargets;

    /**
     * Indicates whether the ability should allow the player to trigger an attack from a unit.
     * Can either be an {@link IInitiateAttack} property object or a function that creates one from
     * an {@link AbilityContext}.
     */
    initiateAttack?: IInitiateAttack | ((context: AbilityContext) => IInitiateAttack);

    printedAbility?: boolean;
    cannotTargetFirst?: boolean;
    effect?: string;
    effectArgs?: EffectArg | ((context: Context) => EffectArg);
    gameSystem?: GameSystem | GameSystem[];
    handler?: (context?: Context) => void;
    then?: ((context?: AbilityContext) => object) | object;
}

interface ITriggeredAbilityCardTarget {
    cardCondition?: (card: Card, context?: TriggeredAbilityContext) => boolean;
}

// export type Token = HonoredToken | DishonoredToken;
