import type { AbilityContext } from './core/ability/AbilityContext';
import type { TriggeredAbilityContext } from './core/ability/TriggeredAbilityContext';
import type { GameSystem } from './core/gameSystem/GameSystem';
import type { Card } from './core/card/Card';
import type { Aspect, Duration, RelativePlayerFilter } from './core/Constants';
import { type RelativePlayer, type CardType, type EventName, type PhaseName, type ZoneFilter, type KeywordName, type AbilityType, type CardTypeFilter } from './core/Constants';
import type { GameEvent } from './core/event/GameEvent';
import type { IActionTargetResolver, IActionTargetsResolver, ITriggeredAbilityTargetResolver, ITriggeredAbilityTargetsResolver } from './TargetInterfaces';
import type { IReplacementEffectSystemProperties } from './gameSystems/ReplacementEffectSystem';
import type { IInitiateAttackProperties } from './gameSystems/InitiateAttackSystem';
import type { ICost } from './core/cost/ICost';
import type Game from './core/Game';
import type PlayerOrCardAbility from './core/ability/PlayerOrCardAbility';
import type Player from './core/Player';
import type { OngoingCardEffect } from './core/ongoingEffect/OngoingCardEffect';
import type { OngoingPlayerEffect } from './core/ongoingEffect/OngoingPlayerEffect';
import type { BaseZone } from './core/zone/BaseZone';
import type { DeckZone } from './core/zone/DeckZone';
import type { DiscardZone } from './core/zone/DiscardZone';
import type { HandZone } from './core/zone/HandZone';
import type { OutsideTheGameZone } from './core/zone/OutsideTheGameZone';
import type { ResourceZone } from './core/zone/ResourceZone';
import type { GroundArenaZone } from './core/zone/GroundArenaZone';
import type { SpaceArenaZone } from './core/zone/SpaceArenaZone';
import type { CaptureZone } from './core/zone/CaptureZone';
import type { IUnitCard } from './core/card/propertyMixins/UnitProperties';

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/lines-around-comment: off */

// ********************************************** EXPORTED TYPES **********************************************

/** Interface definition for addTriggeredAbility */
export type ITriggeredAbilityProps<TSource extends Card = Card> = ITriggeredAbilityWhenProps<TSource> | ITriggeredAbilityAggregateWhenProps<TSource>;
export type IReplacementEffectAbilityProps<TSource extends Card = Card> = IReplacementEffectAbilityWhenProps<TSource> | IReplacementEffectAbilityAggregateWhenProps<TSource>;

/** Interface definition for addActionAbility */
export type IActionAbilityProps<TSource extends Card = Card> = Exclude<IAbilityPropsWithSystems<AbilityContext<TSource>>, 'optional'> & {
    condition?: (context?: AbilityContext<TSource>) => boolean;
    cost?: ICost<AbilityContext<TSource>> | ICost<AbilityContext<TSource>>[] |
      ((context: AbilityContext<TSource>) => ICost<AbilityContext<TSource>> | ICost<AbilityContext<TSource>>[]);

    /**
     * If true, any player can trigger the ability. If false, only the card's controller can trigger it.
     */
    anyPlayer?: boolean;
    phase?: PhaseName | 'any';
};

export interface IOngoingEffectProps {
    targetZoneFilter?: ZoneFilter;
    sourceZoneFilter?: ZoneFilter;
    targetCardTypeFilter?: any;
    matchTarget?: () => boolean;
    canChangeZoneOnce?: boolean;
    canChangeZoneNTimes?: number;
    duration?: Duration;
    condition?: (context: AbilityContext) => boolean;
    until?: WhenType;
    ability?: PlayerOrCardAbility;
    target?: (Player | Card) | (Player | Card)[];
    cannotBeCancelled?: boolean;
    optional?: boolean;
}

export interface IOngoingPlayerEffectProps extends IOngoingEffectProps {
    targetController?: Player | RelativePlayer;
}

export interface IOngoingCardEffectProps extends IOngoingEffectProps {
    targetController?: RelativePlayer;
}

// TODO: since many of the files that use this are JS, it's hard to know if it's fully correct.
// for example, there's ambiguity between IAbilityProps and ITriggeredAbilityProps at the level of PlayerOrCardAbility
/** Base interface for triggered and action ability definitions */
export interface IAbilityProps<TContext extends AbilityContext> {
    title: string;
    zoneFilter?: ZoneFilter | ZoneFilter[];
    limit?: any;
    cardName?: string;

    /**
     * Indicates if triggering the ability is optional (in which case the player will be offered the
     * 'Pass' button on resolution) or if it is mandatory
     */
    optional?: boolean;

    /**
     * If optional is true, indicates which player will make the choice to resolve the optional ability (defaults to RelativePlayer.Self)
     */
    playerChoosingOptional?: RelativePlayer;

    /**
     * Override the default 'Pass' button text
     */
    optionalButtonTextOverride?: string;

    /** Indicates which player can activate this ability (e.g. for Bounty abilities, it is the opponent) */
    // TODO: Update this property's interaction with SubSteps (then/ifYouDo) and the card A New Adventure
    canBeTriggeredBy?: RelativePlayerFilter;

    /** If this is a gained ability, gives the source card that is giving the ability */
    gainAbilitySource?: Card;

    printedAbility?: boolean;
    cannotTargetFirst?: boolean;
    effect?: string;
    effectArgs?: EffectArg | ((context: TContext) => EffectArg);
    then?: ((context?: AbilityContext) => IThenAbilityPropsWithSystems<TContext>) | IThenAbilityPropsWithSystems<TContext>;
    ifYouDo?: ((context?: AbilityContext) => IIfYouDoAbilityPropsWithSystems<TContext>) | IIfYouDoAbilityPropsWithSystems<TContext>;
    ifYouDoNot?: ((context?: AbilityContext) => IAbilityPropsWithSystems<TContext>) | IAbilityPropsWithSystems<TContext>;
}

/** Interface definition for addConstantAbility */
export interface IConstantAbilityProps<TSource extends Card = Card> {
    title: string;
    sourceZoneFilter?: ZoneFilter | ZoneFilter[];

    /** A handler to enable or disable the ability's effects depending on game context */
    condition?: (context: AbilityContext<TSource>) => boolean;

    /** A handler to determine if a specific card is impacted by the ability effect */
    matchTarget?: (card: Card, context?: AbilityContext<TSource>) => boolean;
    targetController?: RelativePlayerFilter;
    targetZoneFilter?: ZoneFilter;
    targetCardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    cardName?: string;
    uuid?: string;
    ongoingEffect: IOngoingEffectGenerator | IOngoingEffectGenerator[];
    createCopies?: boolean;
    abilityIdentifier?: string;
}

export type ITriggeredAbilityPropsWithType<TSource extends Card = Card> = ITriggeredAbilityProps<TSource> & {
    type: AbilityType.Triggered;
};

export type IActionAbilityPropsWithType<TSource extends Card = Card> = IActionAbilityProps<TSource> & {
    type: AbilityType.Action;
};

export type IConstantAbilityPropsWithType<TSource extends Card = Card> = IConstantAbilityProps<TSource> & {
    type: AbilityType.Constant;
};

export type IReplacementEffectAbilityPropsWithType<TSource extends Card = Card> = IReplacementEffectAbilityProps<TSource> & {
    type: AbilityType.ReplacementEffect;
};

export type IAbilityPropsWithType<TSource extends Card = Card> =
  ITriggeredAbilityPropsWithType<TSource> |
  IActionAbilityPropsWithType<TSource> |
  IConstantAbilityPropsWithType<TSource> |
  IReplacementEffectAbilityPropsWithType<TSource>;

// exported for use in situations where we need to exclude "when" and "aggregateWhen"
export type ITriggeredAbilityBaseProps<TSource extends Card = Card> = IAbilityPropsWithSystems<TriggeredAbilityContext<TSource>> & {
    collectiveTrigger?: boolean;
    targetResolver?: ITriggeredAbilityTargetResolver<TriggeredAbilityContext<TSource>>;
    targetResolvers?: ITriggeredAbilityTargetsResolver<TriggeredAbilityContext<TSource>>;
    immediateEffect?: GameSystem<TriggeredAbilityContext<TSource>>;
    handler?: (context: TriggeredAbilityContext) => void;
    then?: ((context?: TriggeredAbilityContext) => IThenAbilityPropsWithSystems<TriggeredAbilityContext>) | IThenAbilityPropsWithSystems<TriggeredAbilityContext>;
    ifYouDo?: ((context?: TriggeredAbilityContext) => IAbilityPropsWithSystems<TriggeredAbilityContext>) | IAbilityPropsWithSystems<TriggeredAbilityContext>;
    ifYouDoNot?: ((context?: TriggeredAbilityContext) => IAbilityPropsWithSystems<TriggeredAbilityContext>) | IAbilityPropsWithSystems<TriggeredAbilityContext>;
};

/** Interface definition for setEventAbility */
export type IEventAbilityProps<TSource extends Card = Card> = IAbilityPropsWithSystems<AbilityContext<TSource>>;

/** Interface definition for setEpicActionAbility */
export type IEpicActionProps<TSource extends Card = Card> = Exclude<IAbilityPropsWithSystems<AbilityContext<TSource>>, 'cost' | 'limit' | 'handler'>;

// TODO KEYWORDS: add remaining keywords to this type
export type IKeywordProperties =
  | IAmbushKeywordProperties
  | IBountyKeywordProperties
  | IGritKeywordProperties
  | IOverwhelmKeywordProperties
  | IPilotingKeywordProperties
  | IRaidKeywordProperties
  | IRestoreKeywordProperties
  | ISaboteurKeywordProperties
  | ISentinelKeywordProperties
  | IShieldedKeywordProperties
  | ISmuggleKeywordProperties;

export type KeywordNameOrProperties = IKeywordProperties | NonParameterKeywordName;

export type Zone =
  | BaseZone
  | CaptureZone
  | DeckZone
  | DiscardZone
  | GroundArenaZone
  | HandZone
  | OutsideTheGameZone
  | ResourceZone
  | SpaceArenaZone;

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

export type WhenType<TSource extends Card = Card> = {
    [EventNameValue in EventName]?: (event: any, context?: TriggeredAbilityContext<TSource>) => boolean;
};

export type IOngoingEffectGenerator = (game: Game, source: Card, props: IOngoingEffectProps) => (OngoingCardEffect | OngoingPlayerEffect);

export type IThenAbilityPropsWithSystems<TContext extends AbilityContext> = IAbilityPropsWithSystems<TContext> & {
    thenCondition?: (context?: TContext) => boolean;
};

export type IIfYouDoAbilityPropsWithSystems<TContext extends AbilityContext> = IAbilityPropsWithSystems<TContext> & {
    ifYouDoCondition?: (context?: TContext) => boolean;
};

export interface IClientUIProperties {
    lastPlayedCard?: ISetId;
}

export interface ISetId {
    set: string;
    number: number;
}

// ********************************************** INTERNAL TYPES **********************************************
interface IReplacementEffectAbilityBaseProps<TSource extends Card = Card> extends Omit<ITriggeredAbilityBaseProps<TSource>,
        'immediateEffect' | 'targetResolver' | 'targetResolvers' | 'handler'
> {
    replaceWith?: IReplacementEffectSystemProperties<TriggeredAbilityContext<TSource>>;
}

type ITriggeredAbilityWhenProps<TSource extends Card> = ITriggeredAbilityBaseProps<TSource> & {
    when: WhenType<TSource>;
};

type ITriggeredAbilityAggregateWhenProps<TSource extends Card> = ITriggeredAbilityBaseProps<TSource> & {
    aggregateWhen: (events: GameEvent[], context: TriggeredAbilityContext) => boolean;
};

interface IAbilityPropsWithTargetResolver<TContext extends AbilityContext> extends IAbilityProps<TContext> {
    targetResolver: IActionTargetResolver<TContext>;
}

interface IAbilityPropsWithTargetResolvers<TContext extends AbilityContext> extends IAbilityProps<TContext> {
    targetResolvers: IActionTargetsResolver<TContext>;
}

interface IAbilityPropsWithImmediateEffect<TContext extends AbilityContext> extends IAbilityProps<TContext> {
    immediateEffect: GameSystem<TContext>;
}

interface IAbilityPropsWithHandler<TContext extends AbilityContext> extends IAbilityProps<TContext> {
    handler: (context: TContext) => void;
}

interface IAbilityPropsWithInitiateAttack<TContext extends AbilityContext> extends IAbilityProps<TContext> {

    /**
     * Indicates that an attack should be triggered from a friendly unit.
     * Shorthand for `AbilityHelper.immediateEffects.attack(AttackSelectionMode.SelectAttackerAndTarget)`.
     * Can either be an {@link IInitiateAttackProperties} property object or a function that creates one from
     * an {@link AbilityContext}.
     */
    initiateAttack?: IInitiateAttackProperties | ((context: TContext) => IInitiateAttackProperties);
}

type IAbilityPropsWithSystems<TContext extends AbilityContext> =
  IAbilityPropsWithImmediateEffect<TContext> |
  IAbilityPropsWithInitiateAttack<TContext> |
  IAbilityPropsWithTargetResolver<TContext> |
  IAbilityPropsWithTargetResolvers<TContext> |
  IAbilityPropsWithHandler<TContext>;

interface IReplacementEffectAbilityWhenProps<TSource extends Card> extends IReplacementEffectAbilityBaseProps<TSource> {
    when: WhenType<TSource>;
}

interface IReplacementEffectAbilityAggregateWhenProps<TSource extends Card> extends IReplacementEffectAbilityBaseProps<TSource> {
    aggregateWhen: (events: GameEvent[], context: TriggeredAbilityContext) => boolean;
}

interface IKeywordPropertiesBase {
    keyword: KeywordName;
}

interface INumericKeywordProperties extends IKeywordPropertiesBase {
    amount: number;
}

interface IKeywordWithAbilityDefinitionProperties<TSource extends Card = Card> extends IKeywordPropertiesBase {
    ability: IAbilityPropsWithSystems<AbilityContext<TSource>>;
}

interface IAmbushKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Ambush;
}

interface IBountyKeywordProperties<TSource extends IUnitCard = IUnitCard> extends IKeywordWithAbilityDefinitionProperties<TSource> {
    keyword: KeywordName.Bounty;
    ability: Omit<ITriggeredAbilityBaseProps<TSource>, 'canBeTriggeredBy'>;
}

interface IGritKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Grit;
}

interface IOverwhelmKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Overwhelm;
}

interface IPilotingKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Piloting;
    cost: number;
    aspects: Aspect[];
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

interface ISmuggleKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Smuggle;
    cost: number;
    aspects: Aspect[];
}

interface IShieldedKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Shielded;
}

type NonParameterKeywordName =
  | KeywordName.Ambush
  | KeywordName.Grit
  | KeywordName.Overwhelm
  | KeywordName.Saboteur
  | KeywordName.Sentinel
  | KeywordName.Shielded;
