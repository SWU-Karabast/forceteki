import type { AbilityContext } from './AbilityContext';
import type { TriggeredAbilityContext } from './TriggeredAbilityContext';
import type { GameAction } from './GameActions/GameAction';
import type Ring = require('./ring');
import type BaseCard = require('./basecard');
import type DrawCard = require('./drawcard');
import type { ProvinceCard } from './ProvinceCard';
import type CardAbility = require('./CardAbility');
import type { DuelProperties } from './GameActions/DuelAction';
import type { Players, TargetModes, CardTypes, Locations, EventNames, Phases } from './Constants';
import type { StatusToken } from './StatusToken';
import type Player = require('./player');

interface BaseTarget {
    activePromptTitle?: string;
    location?: Locations | Locations[];
    controller?: ((context: AbilityContext) => Players) | Players;
    player?: ((context: AbilityContext) => Players) | Players;
    hideIfNoLegalTargets?: boolean;
    gameAction?: GameAction | GameAction[];
}

interface ChoicesInterface {
    [propName: string]: ((context: AbilityContext) => boolean) | GameAction | GameAction[];
}

interface TargetSelect extends BaseTarget {
    mode: TargetModes.Select;
    choices: (ChoicesInterface | {}) | ((context: AbilityContext) => ChoicesInterface | {});
    condition?: (context: AbilityContext) => boolean;
    targets?: boolean;
}

interface TargetRing extends BaseTarget {
    mode: TargetModes.Ring;
    optional?: boolean;
    ringCondition: (ring: Ring, context?: AbilityContext) => boolean;
}

interface TargetAbility extends BaseTarget {
    mode: TargetModes.Ability;
    cardType?: CardTypes | CardTypes[];
    cardCondition?: (card: BaseCard, context?: AbilityContext) => boolean;
    abilityCondition?: (ability: CardAbility) => boolean;
}

interface TargetToken extends BaseTarget {
    mode: TargetModes.Token;
    optional?: boolean;
    location?: Locations | Locations[];
    cardType?: CardTypes | CardTypes[];
    singleToken?: boolean;
    cardCondition?: (card: BaseCard, context?: AbilityContext) => boolean;
    tokenCondition?: (token: StatusToken, context?: AbilityContext) => boolean;
}

interface TargetElementSymbol extends BaseTarget {
    mode: TargetModes.ElementSymbol;
    location?: Locations | Locations[];
    cardType?: CardTypes | CardTypes[];
}

interface BaseTargetCard extends BaseTarget {
    cardType?: CardTypes | CardTypes[];
    location?: Locations | Locations[];
    optional?: boolean;
}

interface TargetCardExactlyUpTo extends BaseTargetCard {
    mode: TargetModes.Exactly | TargetModes.UpTo;
    numCards: number;
    sameDiscardPile?: boolean;
}

interface TargetCardExactlyUpToVariable extends BaseTargetCard {
    mode: TargetModes.ExactlyVariable | TargetModes.UpToVariable;
    numCardsFunc: (context: AbilityContext) => number;
}

interface TargetCardMaxStat extends BaseTargetCard {
    mode: TargetModes.MaxStat;
    numCards: number;
    cardStat: (card: BaseCard) => number;
    maxStat: () => number;
}

interface TargetCardSingleUnlimited extends BaseTargetCard {
    mode?: TargetModes.Single | TargetModes.Unlimited;
}

type TargetCard =
    | TargetCardExactlyUpTo
    | TargetCardExactlyUpToVariable
    | TargetCardMaxStat
    | TargetCardSingleUnlimited
    | TargetAbility
    | TargetToken
    | TargetElementSymbol;

interface SubTarget {
    dependsOn?: string;
}

interface ActionCardTarget {
    cardCondition?: (card: BaseCard, context?: AbilityContext) => boolean;
}

interface ActionRingTarget {
    ringCondition?: (ring: Ring, context?: AbilityContext) => boolean;
}

type ActionTarget = (TargetCard & ActionCardTarget) | (TargetRing & ActionRingTarget) | TargetSelect | TargetAbility;

interface ActionTargets {
    [propName: string]: ActionTarget & SubTarget;
}

export interface InitiateDuel extends DuelProperties {
    opponentChoosesDuelTarget?: boolean;
    opponentChoosesChallenger?: boolean;
    requiresConflict?: boolean;
    challengerCondition?: (card: DrawCard, context: TriggeredAbilityContext) => boolean;
    targetCondition?: (card: DrawCard, context: TriggeredAbilityContext) => boolean;
}

type EffectArg =
    | number
    | string
    | Player
    | DrawCard
    | ProvinceCard
    | Ring
    | { id: string; label: string; name: string; facedown: boolean; type: CardTypes }
    | EffectArg[];

interface AbilityProps<Context> {
    title: string;
    location?: Locations | Locations[];
    cost?: any;
    limit?: any;
    max?: any;
    target?: ActionTarget;
    targets?: ActionTargets;
    initiateDuel?: InitiateDuel | ((context: AbilityContext) => InitiateDuel);
    cannotBeMirrored?: boolean;
    printedAbility?: boolean;
    cannotTargetFirst?: boolean;
    effect?: string;
    evenDuringDynasty?: boolean;
    effectArgs?: EffectArg | ((context: Context) => EffectArg);
    gameAction?: GameAction | GameAction[];
    handler?: (context?: Context) => void;
    then?: ((context?: AbilityContext) => object) | object;
}

export interface ActionProps<Source = any> extends AbilityProps<AbilityContext<Source>> {
    condition?: (context?: AbilityContext<Source>) => boolean;
    phase?: Phases | 'any';
    emeraldWorksInDynsty?: boolean;
    /**
     * @deprecated
     */
    anyPlayer?: boolean;
    conflictProvinceCondition?: (province: ProvinceCard, context: AbilityContext<Source>) => boolean;
    canTriggerOutsideConflict?: boolean;
}

interface TriggeredAbilityCardTarget {
    cardCondition?: (card: BaseCard, context?: TriggeredAbilityContext) => boolean;
}

interface TriggeredAbilityRingTarget {
    ringCondition?: (ring: Ring, context?: TriggeredAbilityContext) => boolean;
}

type TriggeredAbilityTarget =
    | (TargetCard & TriggeredAbilityCardTarget)
    | (TargetRing & TriggeredAbilityRingTarget)
    | TargetSelect;

interface TriggeredAbilityTargets {
    [propName: string]: TriggeredAbilityTarget & SubTarget & TriggeredAbilityTarget;
}

export type WhenType = {
    [EventName in EventNames]?: (event: any, context?: TriggeredAbilityContext) => boolean;
};

export interface TriggeredAbilityWhenProps extends AbilityProps<TriggeredAbilityContext> {
    when: WhenType;
    collectiveTrigger?: boolean;
    anyPlayer?: boolean;
    target?: TriggeredAbilityTarget & TriggeredAbilityTarget;
    targets?: TriggeredAbilityTargets;
    handler?: (context: TriggeredAbilityContext) => void;
    then?: ((context?: TriggeredAbilityContext) => object) | object;
}

export interface TriggeredAbilityAggregateWhenProps extends AbilityProps<TriggeredAbilityContext> {
    aggregateWhen: (events: any[], context: TriggeredAbilityContext) => boolean;
    collectiveTrigger?: boolean;
    target?: TriggeredAbilityTarget & TriggeredAbilityTarget;
    targets?: TriggeredAbilityTargets;
    handler?: (context: TriggeredAbilityContext) => void;
    then?: ((context?: TriggeredAbilityContext) => object) | object;
}

export type TriggeredAbilityProps = TriggeredAbilityWhenProps | TriggeredAbilityAggregateWhenProps;

export interface PersistentEffectProps<Source = any> {
    location?: Locations | Locations[];
    condition?: (context: AbilityContext<Source>) => boolean;
    match?: (card: BaseCard, context?: AbilityContext<Source>) => boolean;
    targetController?: Players;
    targetLocation?: Locations;
    effect: Function | Function[];
    createCopies?: boolean;
}

export type traitLimit = {
    [trait: string]: number;
};

export interface AttachmentConditionProps {
    limit?: number;
    myControl?: boolean;
    opponentControlOnly?: boolean;
    unique?: boolean;
    faction?: string | string[];
    trait?: string | string[];
    limitTrait?: traitLimit | traitLimit[];
    cardCondition?: (card: BaseCard) => boolean;
}

interface HonoredToken {
    honored: true;
    card: DrawCard;
    type: 'token';
}

interface DishonoredToken {
    dishonored: true;
    card: DrawCard;
    type: 'token';
}

export type Token = HonoredToken | DishonoredToken;