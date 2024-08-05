import type { AbilityContext } from './core/ability/AbilityContext';
import type { TriggeredAbilityContext } from './core/ability/TriggeredAbilityContext';
import type { GameSystem } from './core/gameSystem/GameSystem';
import type Card = require('./core/card/Card');
import type CardAbility = require('./core/ability/CardAbility');
import type { IAttackProperties } from './gameSystems/AttackSystem';
import type { Players, TargetModes, CardTypes, Locations, EventNames, Phases } from './core/Constants';
// import type { StatusToken } from './StatusToken';
import type Player = require('./core/Player');

interface IBaseTarget {
    activePromptTitle?: string;
    location?: Locations | Locations[];
    controller?: ((context: AbilityContext) => Players) | Players;
    player?: ((context: AbilityContext) => Players) | Players;
    hideIfNoLegalTargets?: boolean;
    gameSystem?: GameSystem | GameSystem[];
}

interface IChoicesInterface {
    [propName: string]: ((context: AbilityContext) => boolean) | GameSystem | GameSystem[];
}

interface ITargetSelect extends IBaseTarget {
    mode: TargetModes.Select;
    choices: (IChoicesInterface | {}) | ((context: AbilityContext) => IChoicesInterface | {});
    condition?: (context: AbilityContext) => boolean;
    targets?: boolean;
}

interface ITargetAbility extends IBaseTarget {
    mode: TargetModes.Ability;
    cardType?: CardTypes | CardTypes[];
    cardCondition?: (card: Card, context?: AbilityContext) => boolean;
    abilityCondition?: (ability: CardAbility) => boolean;
}

export interface IInitiateAttack extends IAttackProperties {
    opponentChoosesAttackTarget?: boolean;
    opponentChoosesAttacker?: boolean;
    attackerCondition?: (card: Card, context: TriggeredAbilityContext) => boolean;
    targetCondition?: (card: Card, context: TriggeredAbilityContext) => boolean;
}

// interface TargetToken extends BaseTarget {
//     mode: TargetModes.Token;
//     optional?: boolean;
//     location?: Locations | Locations[];
//     cardType?: CardTypes | CardTypes[];
//     singleToken?: boolean;
//     cardCondition?: (card: BaseCard, context?: AbilityContext) => boolean;
//     tokenCondition?: (token: StatusToken, context?: AbilityContext) => boolean;
// }

interface IBaseTargetCard extends IBaseTarget {
    cardType?: CardTypes | CardTypes[];
    location?: Locations | Locations[];
    optional?: boolean;
}

interface ITargetCardExactlyUpTo extends IBaseTargetCard {
    mode: TargetModes.Exactly | TargetModes.UpTo;
    numCards: number;
    sameDiscardPile?: boolean;
}

interface ITargetCardExactlyUpToVariable extends IBaseTargetCard {
    mode: TargetModes.ExactlyVariable | TargetModes.UpToVariable;
    numCardsFunc: (context: AbilityContext) => number;
}

interface ITargetCardMaxStat extends IBaseTargetCard {
    mode: TargetModes.MaxStat;
    numCards: number;
    cardStat: (card: Card) => number;
    maxStat: () => number;
}

interface TargetCardSingleUnlimited extends IBaseTargetCard {
    mode?: TargetModes.Single | TargetModes.Unlimited;
}

type ITargetCard =
    | ITargetCardExactlyUpTo
    | ITargetCardExactlyUpToVariable
    | ITargetCardMaxStat
    | TargetCardSingleUnlimited
    | ITargetAbility;
    // | TargetToken;

interface ISubTarget {
    dependsOn?: string;
}

interface IActionCardTarget {
    cardCondition?: (card: Card, context?: AbilityContext) => boolean;
}

type IActionTarget = (ITargetCard & IActionCardTarget) | ITargetSelect | ITargetAbility;

interface IActionTargets {
    [propName: string]: IActionTarget & ISubTarget;
}

type EffectArg =
    | number
    | string
    | Player
    | Card
    | { id: string; label: string; name: string; facedown: boolean; type: CardTypes }
    | EffectArg[];

interface IAbilityProps<Context> {
    title: string;
    location?: Locations | Locations[];
    cost?: any;
    limit?: any;
    max?: any;
    target?: IActionTarget;
    targets?: IActionTargets;
    cannotBeMirrored?: boolean;
    printedAbility?: boolean;
    cannotTargetFirst?: boolean;
    effect?: string;
    evenDuringDynasty?: boolean;
    effectArgs?: EffectArg | ((context: Context) => EffectArg);
    gameSystem?: GameSystem | GameSystem[];
    handler?: (context?: Context) => void;
    then?: ((context?: AbilityContext) => object) | object;
}

export interface IActionProps<Source = any> extends IAbilityProps<AbilityContext<Source>> {
    condition?: (context?: AbilityContext<Source>) => boolean;
    phase?: Phases | 'any';
    /**
     * @deprecated
     */
    anyPlayer?: boolean;
}

interface ITriggeredAbilityCardTarget {
    cardCondition?: (card: Card, context?: TriggeredAbilityContext) => boolean;
}

type TriggeredAbilityTarget =
    | (ITargetCard & ITriggeredAbilityCardTarget)
    | ITargetSelect;

interface ITriggeredAbilityTargets {
    [propName: string]: TriggeredAbilityTarget & ISubTarget & TriggeredAbilityTarget;
}

export type WhenType = {
    [EventName in EventNames]?: (event: any, context?: TriggeredAbilityContext) => boolean;
};

export interface ITriggeredAbilityWhenProps extends IAbilityProps<TriggeredAbilityContext> {
    when: WhenType;
    collectiveTrigger?: boolean;
    anyPlayer?: boolean;
    target?: TriggeredAbilityTarget & TriggeredAbilityTarget;
    targets?: ITriggeredAbilityTargets;
    handler?: (context: TriggeredAbilityContext) => void;
    then?: ((context?: TriggeredAbilityContext) => object) | object;
}

export interface ITriggeredAbilityAggregateWhenProps extends IAbilityProps<TriggeredAbilityContext> {
    aggregateWhen: (events: any[], context: TriggeredAbilityContext) => boolean;
    collectiveTrigger?: boolean;
    target?: TriggeredAbilityTarget & TriggeredAbilityTarget;
    targets?: ITriggeredAbilityTargets;
    handler?: (context: TriggeredAbilityContext) => void;
    then?: ((context?: TriggeredAbilityContext) => object) | object;
}

export type ITriggeredAbilityProps = ITriggeredAbilityWhenProps | ITriggeredAbilityAggregateWhenProps;

export interface IPersistentEffectProps<Source = any> {
    location?: Locations | Locations[];
    condition?: (context: AbilityContext<Source>) => boolean;
    match?: (card: Card, context?: AbilityContext<Source>) => boolean;
    targetController?: Players;
    targetLocation?: Locations;
    effect: Function | Function[];
    createCopies?: boolean;
}

export type traitLimit = {
    [trait: string]: number;
};

export interface IAttachmentConditionProps {
    limit?: number;
    myControl?: boolean;
    opponentControlOnly?: boolean;
    unique?: boolean;
    faction?: string | string[];
    trait?: string | string[];
    limitTrait?: traitLimit | traitLimit[];
    cardCondition?: (card: Card) => boolean;
}

// export type Token = HonoredToken | DishonoredToken;