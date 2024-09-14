import type { AbilityContext } from './core/ability/AbilityContext';
import type { TriggeredAbilityContext } from './core/ability/TriggeredAbilityContext';
import type { GameSystem } from './core/gameSystem/GameSystem';
import type { Card } from './core/card/Card';
import type { IAttackProperties } from './gameSystems/AttackStepsSystem';
import { type RelativePlayer, type TargetMode, type CardType, type Location, type EventName, type PhaseName, type LocationFilter, type KeywordName, type AbilityType, type CardTypeFilter, Aspect } from './core/Constants';
import type { GameEvent } from './core/event/GameEvent';
import type { IActionTargetResolver, IActionTargetsResolver, ITriggeredAbilityTargetResolver, ITriggeredAbilityTargetsResolver } from './TargetInterfaces';
import { IReplacementEffectSystemProperties } from './gameSystems/ReplacementEffectSystem';
import { IInitiateAttackProperties } from './gameSystems/InitiateAttackSystem';

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/js/lines-around-comment: off */

// ********************************************** EXPORTED TYPES **********************************************

/** Interface definition for addTriggeredAbility */
export type ITriggeredAbilityProps = ITriggeredAbilityWhenProps | ITriggeredAbilityAggregateWhenProps;
export type IReplacementEffectAbilityProps = IReplacementEffectAbilityWhenProps | IReplacementEffectAbilityAggregateWhenProps;

/** Interface definition for addActionAbility */
export type IActionAbilityProps<Source = any> = Exclude<IAbilityPropsWithSystems<AbilityContext<Source>>, 'optional'> & {
    condition?: (context?: AbilityContext<Source>) => boolean;

    /**
     * If true, any player can trigger the ability. If false, only the card's controller can trigger it.
     */
    anyPlayer?: boolean;
    phase?: PhaseName | 'any';
}

/** Interface definition for addConstantAbility */
export interface IConstantAbilityProps<Source = any> {
    title: string;
    sourceLocationFilter?: LocationFilter | LocationFilter[];
    /** A handler to enable or disable the ability's effects depending on game context */
    condition?: (context: AbilityContext<Source>) => boolean;
    /** A handler to determine if a specific card is impacted by the ability effect */
    matchTarget?: (card: Card, context?: AbilityContext<Source>) => boolean;
    targetController?: RelativePlayer;
    targetLocationFilter?: LocationFilter;
    targetCardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    cardName?: string;

    // TODO: can we get a real signature here
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    ongoingEffect: Function | Function[];

    createCopies?: boolean;
}

// exported for use in situations where we need to exclude "when" and "aggregateWhen"
export type ITriggeredAbilityBaseProps = IAbilityPropsWithSystems<TriggeredAbilityContext> & {
    collectiveTrigger?: boolean;
    targetResolver?: ITriggeredAbilityTargetResolver;
    targetResolvers?: ITriggeredAbilityTargetsResolver;
    handler?: (context: TriggeredAbilityContext) => void;
    then?: ((context?: TriggeredAbilityContext) => IAbilityProps<TriggeredAbilityContext>) | IAbilityProps<TriggeredAbilityContext>;
}

/** Interface definition for setEventAbility */
export type IEventAbilityProps<Source = any> = IAbilityPropsWithSystems<AbilityContext<Source>>;

/** Interface definition for setEpicActionAbility */
export type IEpicActionProps<Source = any> = Exclude<IAbilityPropsWithSystems<AbilityContext<Source>>, 'cost' | 'limit' | 'handler'>;


interface IReplacementEffectAbilityBaseProps extends Omit<ITriggeredAbilityBaseProps,
        'immediateEffect' | 'targetResolver' | 'targetResolvers' | 'handler'
> {
    replaceWith: IReplacementEffectSystemProperties
}

// TODO KEYWORDS: add remaining keywords to this type
export type IKeywordProperties =
    | IAmbushKeywordProperties
    | IGritKeywordProperties
    | IOverwhelmKeywordProperties
    | IRaidKeywordProperties
    | IRestoreKeywordProperties
    | ISaboteurKeywordProperties
    | ISentinelKeywordProperties
    | IShieldedKeywordProperties;

export type KeywordNameOrProperties = IKeywordProperties | NonParameterKeywordName;

export interface IStateListenerProperties<TState> {
    when: WhenType;
    update: (currentState: TState, event: any) => TState;
}

export interface IStateListenerResetProperties {
    when: WhenType;
}

export type traitLimit = Record<string, number>;

export type EffectArg =
    | number
    | string
    | RelativePlayer
    | Card
    | { id: string; label: string; name: string; facedown: boolean; type: CardType }
    | EffectArg[];

export type WhenType = {
        [EventNameValue in EventName]?: (event: any, context?: TriggeredAbilityContext) => boolean;
    };

// ********************************************** INTERNAL TYPES **********************************************
type ITriggeredAbilityWhenProps = ITriggeredAbilityBaseProps & {
    when: WhenType;
}

type ITriggeredAbilityAggregateWhenProps = ITriggeredAbilityBaseProps & {
    aggregateWhen: (events: GameEvent[], context: TriggeredAbilityContext) => boolean;
}

// TODO: since many of the files that use this are JS, it's hard to know if it's fully correct.
// for example, there's ambiguity between IAbilityProps and ITriggeredAbilityProps at the level of PlayerOrCardAbility
/** Base interface for triggered and action ability definitions */
interface IAbilityProps<Context> {
    title: string;
    locationFilter?: LocationFilter | LocationFilter[];
    cost?: any;
    limit?: any;
    cardName?: string;

    /**
     * Indicates if triggering the ability is optional (in which case the player will be offered the
     * 'Pass' button on resolution) or if it is mandatory
     */
    optional?: boolean;

    printedAbility?: boolean;
    cannotTargetFirst?: boolean;
    effect?: string;
    effectArgs?: EffectArg | ((context: Context) => EffectArg);
    then?: ((context?: AbilityContext) => IAbilityPropsWithSystems<Context>) | IAbilityPropsWithSystems<Context>;
}

interface IAbilityPropsWithTargetResolver<Context> extends IAbilityProps<Context> {
    targetResolver: IActionTargetResolver;
}

interface IAbilityPropsWithTargetResolvers<Context> extends IAbilityProps<Context> {
    targetResolvers: IActionTargetsResolver;
}

interface IAbilityPropsWithImmediateEffect<Context> extends IAbilityProps<Context> {
    immediateEffect: GameSystem | GameSystem[];
}

interface IAbilityPropsWithHandler<Context> extends IAbilityProps<Context> {
    handler: (context: Context) => void;
}

interface IAbilityPropsWithInitiateAttack<Context> extends IAbilityProps<Context> {
    /**
     * Indicates that an attack should be triggered from a friendly unit.
     * Shorthand for `AbilityHelper.immediateEffects.attack(AttackSelectionMode.SelectAttackerAndTarget)`.
     * Can either be an {@link IInitiateAttackProperties} property object or a function that creates one from
     * an {@link AbilityContext}.
     */
    initiateAttack?: IInitiateAttackProperties | ((context: AbilityContext) => IInitiateAttackProperties);
}

type IAbilityPropsWithSystems<Context> =
    IAbilityPropsWithImmediateEffect<Context> |
    IAbilityPropsWithInitiateAttack<Context> |
    IAbilityPropsWithTargetResolver<Context> |
    IAbilityPropsWithTargetResolvers<Context> |
    IAbilityPropsWithHandler<Context>;

interface IReplacementEffectAbilityWhenProps extends IReplacementEffectAbilityBaseProps {
    when: WhenType;
}

interface IReplacementEffectAbilityAggregateWhenProps extends IReplacementEffectAbilityBaseProps {
    aggregateWhen: (events: GameEvent[], context: TriggeredAbilityContext) => boolean;
}

interface IKeywordPropertiesBase {
    keyword: KeywordName;
}

interface INumericKeywordProperties extends IKeywordPropertiesBase {
    amount: number;
}

interface IAmbushKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Ambush;
}

interface IGritKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Grit;
}

interface IOverwhelmKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Overwhelm;
}

interface IRaidKeywordProperties extends INumericKeywordProperties {
    keyword: KeywordName.Raid;
}

interface IRestoreKeywordProperties extends INumericKeywordProperties {
    keyword: KeywordName.Restore;
}

interface ISaboteurKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Saboteur;
}

interface ISentinelKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Sentinel;
}

interface IShieldedKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Shielded;
}

export type NonParameterKeywordName =
    | KeywordName.Ambush
    | KeywordName.Grit
    | KeywordName.Overwhelm
    | KeywordName.Saboteur
    | KeywordName.Sentinel
    | KeywordName.Shielded;
