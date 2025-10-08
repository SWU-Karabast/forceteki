import type { AbilityContext } from './core/ability/AbilityContext';
import type { TriggeredAbilityContext } from './core/ability/TriggeredAbilityContext';
import type { GameSystem } from './core/gameSystem/GameSystem';
import type { Card } from './core/card/Card';
import type { Aspect, Duration, RelativePlayerFilter, StandardTriggeredAbilityType } from './core/Constants';
import { type RelativePlayer, type CardType, type EventName, type PhaseName, type ZoneFilter, type KeywordName, type AbilityType, type CardTypeFilter } from './core/Constants';
import type { GameEvent } from './core/event/GameEvent';
import type { IActionTargetResolver, IActionTargetsResolver, ITriggeredAbilityTargetResolver, ITriggeredAbilityTargetsResolver } from './TargetInterfaces';
import type { IReplacementEffectSystemProperties } from './gameSystems/ReplacementEffectSystem';
import type { ICost } from './core/cost/ICost';
import type Game from './core/Game';
import type { PlayerOrCardAbility } from './core/ability/PlayerOrCardAbility';
import type { Player } from './core/Player';
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
import type { DelayedEffectType } from './gameSystems/DelayedEffectSystem';
import type { IUpgradeCard } from './core/card/CardInterfaces';
import type { IInitiateAttackProperties } from './gameSystems/InitiateAttackSystem';
import type { FormatMessage } from './core/chat/GameChat';
import type { ISnapshotSettingsBase } from './core/snapshot/SnapshotInterfaces';
import type { Lobby } from '../gamenode/Lobby';
import type { IInPlayCard } from './core/card/baseClasses/InPlayCard';

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

    // If true, the action will not be automatically triggered when it's the only one available.
    requiresConfirmation?: boolean;
};

export interface IOngoingEffectProps<TTarget> {
    targetZoneFilter?: ZoneFilter;
    sourceZoneFilter?: ZoneFilter | ZoneFilter[];
    targetCardTypeFilter?: any;
    matchTarget?: TTarget | ((target: TTarget, context: AbilityContext) => boolean);
    canChangeZoneOnce?: boolean;
    canChangeZoneNTimes?: number;
    duration?: Duration;
    condition?: (context: AbilityContext) => boolean;
    until?: WhenType;
    ability?: PlayerOrCardAbility;
    target?: TTarget | TTarget[];
    cannotBeCancelled?: boolean;
    optional?: boolean;
    delayedEffectType?: DelayedEffectType;
    isLastingEffect?: boolean;
}

export type IOngoingCardOrPlayerEffectProps<TTarget extends Card | Player> = TTarget extends Card ? IOngoingCardEffectProps : IOngoingPlayerEffectProps;

export interface IOngoingPlayerEffectProps extends IOngoingEffectProps<Player> {
    targetController?: RelativePlayerFilter;
}

export interface IOngoingCardEffectProps extends IOngoingEffectProps<Card> {
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
    then?: ((context?: TContext) => IThenAbilityPropsWithSystems<TContext>) | IThenAbilityPropsWithSystems<TContext>;
    ifYouDo?: ((context?: TContext) => IIfYouDoAbilityPropsWithSystems<TContext>) | IIfYouDoAbilityPropsWithSystems<TContext>;
    ifYouDoNot?: ((context?: TContext) => IAbilityPropsWithSystems<TContext>) | IAbilityPropsWithSystems<TContext>;
}

export interface IAbilityPropsWithSystems<TContext extends AbilityContext> extends IAbilityProps<TContext> {
    targetResolver?: IActionTargetResolver<TContext>;
    targetResolvers?: IActionTargetsResolver<TContext>;
    immediateEffect?: GameSystem<TContext>;
    handler?: (context: TContext) => void;

    /**
     * Indicates that an attack should be triggered from a friendly unit.
     * Shorthand for `AbilityHelper.immediateEffects.attack(AttackSelectionMode.SelectAttackerAndTarget)`.
     * Can either be an {@link IInitiateAttackProperties} property object or a function that creates one from
     * an {@link AbilityContext}.
     */
    initiateAttack?: IInitiateAttackProperties | ((context: TContext) => IInitiateAttackProperties);

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
    ongoingEffect: IOngoingEffectGenerator | IOngoingEffectGenerator[];
    abilityIdentifier?: string;
    printedAbility?: boolean;
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

export interface IPlayRestrictionAbilityProps {
    title: string;
    restrictedActionCondition?: (context: AbilityContext, source: Card) => boolean;
}

/** Ability types with gain contdition */
export type IConstantAbilityPropsWithGainCondition<TSource extends IUpgradeCard, TTarget extends Card> = IConstantAbilityProps<TTarget> & IGainCondition<TSource>;
export type ITriggeredAbilityPropsWithGainCondition<TSource extends IUpgradeCard, TTarget extends Card> = ITriggeredAbilityProps<TTarget> & IGainCondition<TSource>;
export type ITriggeredAbilityBasePropsWithGainCondition<TSource extends IUpgradeCard, TTarget extends Card> = ITriggeredAbilityBaseProps<TTarget> & IGainCondition<TSource>;
export type IActionAbilityPropsWithGainCondition<TSource extends IUpgradeCard, TTarget extends Card> = IActionAbilityProps<TTarget> & IGainCondition<TSource>;
export type IReplacementEffectAbilityPropsWithGainCondition<TSource extends IUpgradeCard, TTarget extends Card> = IReplacementEffectAbilityProps<TTarget> & IGainCondition<TSource>;

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
    then?: ((context?: TriggeredAbilityContext<TSource>) => IThenAbilityPropsWithSystems<TriggeredAbilityContext<TSource>>) | IThenAbilityPropsWithSystems<TriggeredAbilityContext<TSource>>;
    ifYouDo?: ((context?: TriggeredAbilityContext<TSource>) => IAbilityPropsWithSystems<TriggeredAbilityContext<TSource>>) | IAbilityPropsWithSystems<TriggeredAbilityContext<TSource>>;
    ifYouDoNot?: ((context?: TriggeredAbilityContext<TSource>) => IAbilityPropsWithSystems<TriggeredAbilityContext<TSource>>) | IAbilityPropsWithSystems<TriggeredAbilityContext<TSource>>;
};

/** Interface definition for setEventAbility */
export type IEventAbilityProps<TSource extends Card = Card> = IAbilityPropsWithSystems<AbilityContext<TSource>>;

/** Interface definition for setEpicActionAbility */
export type IEpicActionProps<TSource extends Card = Card> = Exclude<IAbilityPropsWithSystems<AbilityContext<TSource>>, 'cost' | 'limit' | 'handler'>;

export type IKeywordProperties =
  | IAmbushKeywordProperties
  | IBountyKeywordProperties
  | ICoordinateKeywordProperties
  | IGritKeywordProperties
  | IHiddenKeywordProperties
  | IOverwhelmKeywordProperties
  | IPilotingKeywordProperties
  | IPlotKeywordProperties
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
  | FormatMessage
  | { id: string; label: string; name: string; facedown: boolean; type: CardType }
  | EffectArg[];

export type WhenType<TSource extends Card = Card> = {
    [EventNameValue in EventName]?: (event: any, context?: TriggeredAbilityContext<TSource>) => boolean;
};

export type WhenTypeOrStandard<TSource extends Card = Card> = WhenType<TSource> & {
    [StandardTriggeredAbilityTypeValue in StandardTriggeredAbilityType]?: true;
};

export type IOngoingCardOrPlayerEffect<TTarget extends Card | Player> = TTarget extends Card ? OngoingCardEffect : OngoingPlayerEffect;

export type IOngoingCardOrPlayerEffectGenerator<TTarget extends Card | Player> = (game: Game, source: Card, props: IOngoingCardOrPlayerEffectProps<TTarget>) => IOngoingCardOrPlayerEffect<TTarget>;
export type IOngoingCardEffectGenerator = IOngoingCardOrPlayerEffectGenerator<Card>;
export type IOngoingPlayerEffectGenerator = IOngoingCardOrPlayerEffectGenerator<Player>;
export type IOngoingEffectGenerator = IOngoingCardEffectGenerator | IOngoingPlayerEffectGenerator;

export type IOngoingEffectFactory<TTarget> = IOngoingEffectProps<TTarget> & {
    ongoingEffect: any; // IOngoingEffectGenerator | IOngoingEffectGenerator[]
};

export type IThenAbilityPropsWithSystems<TContext extends AbilityContext> = IAbilityPropsWithSystems<TContext> & {
    thenCondition?: (context?: TContext) => boolean;
};

export type IIfYouDoAbilityPropsWithSystems<TContext extends AbilityContext> = IAbilityPropsWithSystems<TContext> & {
    ifYouDoCondition?: (context?: TContext) => boolean;
};

export interface IGainCondition<TSource extends IUpgradeCard> {
    gainCondition?: (context: AbilityContext<TSource>) => boolean;
}

export interface IAttachCardContext<TSource extends IInPlayCard> {
    /**
     * The card that is the source of the attach condition
     */
    source: TSource;

    /**
     * The player who will control the upgrade at the time of attachment
     */
    player: Player;

    /**
     * The card being targeted for attachment
     */
    target: Card;
}

export type IKeywordPropertiesWithGainCondition<TSource extends IUpgradeCard> = IKeywordProperties & IGainCondition<TSource>;

export interface IClientUIProperties {
    lastPlayedCard?: ISetId;
}

export interface ISetId {
    set: string;
    number: number;
}

export type ISerializationError = Record<string, string>;

export interface IResourceState {
    readyCount: number;
    exhaustedCount: number;
}

type ISafeSerializedType<T> = T | ISerializationError;
type ISafeSerializedArrayType<T> = (T | ISerializationError)[] | ISerializationError;

export interface ISerializedUpgradeState {
    card: string;
    ownerAndController: ISafeSerializedType<string>;
}

export interface ISerializedCapturedCardState {
    card: string;
    owner: ISafeSerializedType<string>;
}

/* Serialized state retrieving interfaces */
export interface ISerializedCardState {
    card: string;
    damage?: ISafeSerializedType<number>;
    upgrades?: ISafeSerializedArrayType<ISerializedUpgradeState | string>;
    deployed?: ISafeSerializedType<boolean>;
    exhausted?: ISafeSerializedType<boolean>;
    capturedUnits?: ISafeSerializedArrayType<ISerializedCapturedCardState | string>;
    flipped?: ISafeSerializedType<boolean>;
    owner?: ISafeSerializedType<string>;
}

export interface IPlayerSerializedState {
    hand?: number | string[];
    groundArena?: ISafeSerializedArrayType<string | ISerializedCardState>;
    spaceArena?: ISafeSerializedArrayType<string | ISerializedCardState>;
    discard?: ISafeSerializedArrayType<string>;
    resources?: ISafeSerializedType<number | IResourceState> | ISafeSerializedArrayType<(string | ISerializedCardState)>;
    base?: ISafeSerializedType<string | ISerializedCardState>;
    leader?: ISafeSerializedType<string | ISerializedCardState>;
    deck?: ISafeSerializedType<number> | ISafeSerializedArrayType<string>;
    hasInitiative?: ISafeSerializedType<boolean>;
    hasForceToken?: ISafeSerializedType<boolean>;
}

export interface ISerializedGameState {
    phase?: string;
    reportingPlayer?: ISafeSerializedType<IPlayerSerializedState>;
    opponent?: ISafeSerializedType<IPlayerSerializedState>;
    player1?: ISafeSerializedType<IPlayerSerializedState>;
    player2?: ISafeSerializedType<IPlayerSerializedState>;
    error?: string;
}

export type MessageText = string | (string | number)[];

export interface ISerializedMessage {
    date: Date;
    message: MessageText | { alert: { type: string; message: string | string[] } };
}

export interface ISerializedReportState {
    description: string;
    gameState: ISerializedGameState;
    reporter: {
        id: string;
        username: string;
        playerInGameState: string;
    };
    opponent: {
        id: string;
        username: string;
        playerInGameState: string;
    };
    lobbyId: string;
    timestamp: string;
    messages: ISerializedMessage[];
    gameStepsSinceLastUndo: string;
    gameId?: string;
    screenResolution?: { width: number; height: number } | null;
    viewport?: { width: number; height: number } | null;
}

export interface ISerializedUndoFailureState {
    lobbyId: Lobby['id'];
    gameId: Game['id'];
    settings: ISnapshotSettingsBase;
    preUndoState: ISerializedGameState;
}

export interface IEventRegistration<Handler = () => void> {
    name: string;
    handler: Handler;
}

// ********************************************** INTERNAL TYPES **********************************************
interface IReplacementEffectAbilityBaseProps<TSource extends Card = Card> extends Omit<ITriggeredAbilityBaseProps<TSource>,
        'immediateEffect' | 'targetResolver' | 'targetResolvers' | 'handler'
> {
    replaceWith?: IReplacementEffectSystemProperties<TriggeredAbilityContext<TSource>>;
}

type ITriggeredAbilityWhenProps<TSource extends Card> = ITriggeredAbilityBaseProps<TSource> & {
    when: WhenTypeOrStandard<TSource>;
};

type ITriggeredAbilityAggregateWhenProps<TSource extends Card> = ITriggeredAbilityBaseProps<TSource> & {
    aggregateWhen: (events: GameEvent[], context: TriggeredAbilityContext) => boolean;
};

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

interface IKeywordWithCostProperties extends IKeywordPropertiesBase {
    cost: number;
    aspects: Aspect[];
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

interface ICoordinateKeywordProperties<TSource extends IUnitCard = IUnitCard> extends IKeywordWithAbilityDefinitionProperties<TSource> {
    keyword: KeywordName.Coordinate;
    ability: IAbilityPropsWithType<TSource>;
}

interface IGritKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Grit;
}

interface IHiddenKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Hidden;
}

interface IOverwhelmKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Overwhelm;
}

interface IPilotingKeywordProperties extends IKeywordWithCostProperties {
    keyword: KeywordName.Piloting;
}

interface IPlotKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Plot;
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

interface ISmuggleKeywordProperties extends IKeywordWithCostProperties {
    keyword: KeywordName.Smuggle;
}

interface IShieldedKeywordProperties extends IKeywordPropertiesBase {
    keyword: KeywordName.Shielded;
}

/** List of keywords that don't have any additional parameters */
export type NonParameterKeywordName =
  | KeywordName.Ambush
  | KeywordName.Grit
  | KeywordName.Hidden
  | KeywordName.Overwhelm
  | KeywordName.Saboteur
  | KeywordName.Sentinel
  | KeywordName.Shielded;

export type NumericKeywordName =
  | KeywordName.Raid
  | KeywordName.Restore
  | KeywordName.Exploit;