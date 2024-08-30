import type { AbilityContext } from './core/ability/AbilityContext';
import type { TriggeredAbilityContext } from './core/ability/TriggeredAbilityContext';
import type { GameSystem } from './core/gameSystem/GameSystem';
import type { Card } from './core/card/Card';
import type { IAttackProperties } from './gameSystems/AttackSystem';
import type { RelativePlayer, TargetMode, CardType, Location, EventName, PhaseName, LocationFilter, KeywordName, AbilityType, CardTypeFilter } from './core/Constants';
import type { GameEvent } from './core/event/GameEvent';
import type { IActionTargetResolver, IActionTargetsResolver, ITriggeredAbilityTargetResolver, ITriggeredAbilityTargetsResolver } from './TargetInterfaces';

// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/js/lines-around-comment: off */

// ********************************************** EXPORTED TYPES **********************************************

/** Interface definition for addTriggeredAbility */
export type ITriggeredAbilityProps = ITriggeredAbilityWhenProps | ITriggeredAbilityAggregateWhenProps;

/** Interface definition for addActionAbility */
export interface IActionAbilityProps<Source = any> extends IAbilityProps<AbilityContext<Source>> {
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
    locationFilter?: LocationFilter | LocationFilter[];
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

/** Interface definition for setEventAbility */
export type IEventAbilityProps<Source = any> = IAbilityProps<AbilityContext<Source>>;

/** Interface definition for setEpicActionAbility */
export type IEpicActionProps<Source = any> = Omit<IAbilityProps<AbilityContext<Source>>, 'cost' | 'limit' | 'handler'>;

// TODO: since many of the files that use this are JS, it's hard to know if it's fully correct.
// for example, there's ambiguity between IAbilityProps and ITriggeredAbilityProps at the level of PlayerOrCardAbility
/** Base interface for triggered and action ability definitions */
export interface IAbilityProps<Context> {
    title: string;
    locationFilter?: LocationFilter | LocationFilter[];
    cost?: any;
    limit?: any;
    targetResolver?: IActionTargetResolver;
    targetResolvers?: IActionTargetsResolver;
    cardName?: string;

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
    immediateEffect?: GameSystem | GameSystem[];
    handler?: (context?: Context) => void;
    then?: ((context?: AbilityContext) => object) | object;
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

export interface IInitiateAttack extends IAttackProperties {
    opponentChoosesAttackTarget?: boolean;
    opponentChoosesAttacker?: boolean;
    attackerCondition?: (card: Card, context: TriggeredAbilityContext) => boolean;
    targetCondition?: (card: Card, context: TriggeredAbilityContext) => boolean;
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
interface ITriggeredAbilityWhenProps extends ITriggeredAbilityBaseProps {
    when: WhenType;
}

interface ITriggeredAbilityAggregateWhenProps extends ITriggeredAbilityBaseProps {
    aggregateWhen: (events: GameEvent[], context: TriggeredAbilityContext) => boolean;
}

interface ITriggeredAbilityBaseProps extends IAbilityProps<TriggeredAbilityContext> {
    collectiveTrigger?: boolean;
    targetResolver?: ITriggeredAbilityTargetResolver;
    targetResolvers?: ITriggeredAbilityTargetsResolver;
    handler?: (context: TriggeredAbilityContext) => void;
    then?: ((context?: TriggeredAbilityContext) => object) | object;

    /**
     * If true, the ability can be triggered by any player. If false, only the card's controller can
     * trigger it.
     */
    anyPlayer?: boolean;

    /**
     * Indicates if triggering the ability is optional (in which case the player will be offered the
     * 'Pass' button on resolution) or if it is mandatory
     */
    optional?: boolean;
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