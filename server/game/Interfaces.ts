import type { AbilityContext } from './core/ability/AbilityContext';
import type { TriggeredAbilityContext } from './core/ability/TriggeredAbilityContext';
import type { GameSystem } from './core/gameSystem/GameSystem';
import type Card from './core/card/Card';
import type CardAbility from './core/ability/CardAbility';
import type { IAttackProperties } from './gameSystems/AttackSystem';
import type { RelativePlayer, TargetMode, CardType, Location, EventName, PhaseName, LocationFilter } from './core/Constants';
// import type { StatusToken } from './StatusToken';

interface IBaseTarget {
    activePromptTitle?: string;
    location?: Location | Location[];
    controller?: ((context: AbilityContext) => RelativePlayer) | RelativePlayer;
    player?: ((context: AbilityContext) => RelativePlayer) | RelativePlayer;
    hideIfNoLegalTargets?: boolean;
    gameSystem?: GameSystem | GameSystem[];
}

type IChoicesInterface = Record<string, ((context: AbilityContext) => boolean) | GameSystem | GameSystem[]>;

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

export interface IInitiateAttack extends IAttackProperties {
    opponentChoosesAttackTarget?: boolean;
    opponentChoosesAttacker?: boolean;
    attackerCondition?: (card: Card, context: TriggeredAbilityContext) => boolean;
    targetCondition?: (card: Card, context: TriggeredAbilityContext) => boolean;
}

// interface TargetToken extends BaseTarget {
//     mode: TargetMode.Token;
//     optional?: boolean;
//     location?: Location | Location[];
//     cardType?: CardType | CardType[];
//     singleToken?: boolean;
//     cardCondition?: (card: BaseCard, context?: AbilityContext) => boolean;
//     tokenCondition?: (token: StatusToken, context?: AbilityContext) => boolean;
// }

interface IBaseTargetCard extends IBaseTarget {
    cardType?: CardType | CardType[];
    location?: Location | Location[];
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
    // | TargetToken;

interface ISubTarget {
    dependsOn?: string;
}

interface IActionCardTarget {
    cardCondition?: (card: Card, context?: AbilityContext) => boolean;
}

type IActionTarget = (ITargetCard & IActionCardTarget) | ITargetSelect | ITargetAbility;

type IActionTargets = Record<string, IActionTarget & ISubTarget>;

type EffectArg =
    | number
    | string
    | RelativePlayer
    | Card
    | { id: string; label: string; name: string; facedown: boolean; type: CardType }
    | EffectArg[];

interface IAbilityProps<Context> {
    title: string;
    location?: Location | Location[];
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
    phase?: PhaseName | 'any';

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

type ITriggeredAbilityTargets = Record<string, TriggeredAbilityTarget & ISubTarget & TriggeredAbilityTarget>;

export type WhenType = {
    [EventNameValue in EventName]?: (event: any, context?: TriggeredAbilityContext) => boolean;
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

export interface IConstantAbilityProps<Source = any> {
    // TODO: is this the right name or should it be 'location' like it was before?
    locationFilter?: LocationFilter | LocationFilter[];
    // TODO: what's the difference between condition and match?
    condition?: (context: AbilityContext<Source>) => boolean;
    match?: (card: Card, context?: AbilityContext<Source>) => boolean;
    targetController?: RelativePlayer;
    targetLocation?: Location;

    // TODO: can we get a real signature here
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    effect: Function | Function[];

    createCopies?: boolean;
}

export type traitLimit = Record<string, number>;

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
