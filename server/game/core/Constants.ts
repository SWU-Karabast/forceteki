// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/lines-around-comment: off */

export enum ZoneName {
    Base = 'base',
    Capture = 'capture',
    Deck = 'deck',
    Discard = 'discard',
    GroundArena = 'groundArena',
    Hand = 'hand',
    OutsideTheGame = 'outsideTheGame',
    Resource = 'resource',
    SpaceArena = 'spaceArena',
}

export enum DeckZoneDestination {
    DeckTop = 'deckTop',
    DeckBottom = 'deckBottom'
}

export enum SnapshotType {
    Action = 'action',
    Manual = 'manual',
    Phase = 'phase',
    Round = 'round'
}

export enum ChatObjectType {
    Player = 'player',
    Card = 'card',
}

/**
 * Helper type used when a passed ZoneName represents a move destination.
 * Used to account for moving to top or bottom of deck.
 */
export type MoveZoneDestination = Exclude<ZoneName, ZoneName.Deck | ZoneName.Capture> | DeckZoneDestination.DeckBottom | DeckZoneDestination.DeckTop;

export enum WildcardZoneName {
    Any = 'any',
    AnyArena = 'anyArena',

    /** Any zone that is a valid attack target - an arena or base zone */
    AnyAttackable = 'anyAttackable'
}

export type ZoneFilter = ZoneName | WildcardZoneName;

export type Arena = ZoneName.GroundArena | ZoneName.SpaceArena;

export enum DeployType {
    LeaderUpgrade = 'leaderUpgrade',
    LeaderUnit = 'leaderUnit',
}

export enum PlayType {
    Piloting = 'piloting',
    PlayFromHand = 'playFromHand',
    PlayFromOutOfPlay = 'playFromOutOfPlay',
    Smuggle = 'smuggle',
}

export enum StatType {
    Hp = 'hp',
    Power = 'power'
}

export enum DamageType {
    Combat = 'combat',
    Ability = 'ability',
    Excess = 'excess',
    Overwhelm = 'overwhelm'
}

export enum EffectName {
    AbilityRestrictions = 'abilityRestrictions',
    AdditionalAction = 'additionalActions',
    AdditionalActionAfterWindowCompleted = 'additionalActionsAfterWindowCompleted',
    AdditionalPlayCost = 'additionalPlaycost',
    AdditionalTriggerCost = 'additionalTriggercost',
    AssignIndirectDamageDealtToOpponents = 'assignIndirectDamageDealtToOpponents',
    AssignIndirectDamageDealtByUnit = 'assignIndirectDamageDealtByUnit',
    Blank = 'blank',
    CanAttackGroundArenaFromSpaceArena = 'canAttackGroundArenaFromSpaceArena',
    CanAttackSpaceArenaFromGroundArena = 'canAttackSpaceArenaFromGroundArena',
    CanAttackMultipleUnitsSimultaneously = 'canAttackMultipleUnitsSimultaneously',
    CanBeTriggeredByOpponent = 'canBeTriggeredByOpponent',
    CanBePlayedWithPilotingIgnoringPilotLimit = 'canBePlayedWithPilotingIgnoringPilotLimit',
    CannotBeDefeatedByDamage = 'cannotBeDefeatedByDamage',
    CanPlayFromDiscard = 'canPlayFromDiscard',
    ChangeType = 'changeType',
    CostAdjuster = 'costAdjuster',
    DelayedEffect = 'delayedEffect',
    DoesNotReady = 'doesNotReady',
    DealsDamageBeforeDefender = 'dealsDamageBeforeDefender',
    EntersPlayReady = 'entersPlayReady',
    GainAbility = 'gainAbility',
    GainKeyword = 'gainKeyword',
    GainTrait = 'gainTrait',
    IncreaseLimitOnAbilities = 'increaseLimitOnAbilities',
    IsClonedUnit = 'isClonedUnit',
    IsLeader = 'isLeader',
    LoseKeyword = 'loseKeyword',
    LoseTrait = 'loseTrait',
    ModifyHp = 'modifyHp',
    ModifyIndirectDamage = 'modifyIndirectDamage',
    ModifyPilotLimit = 'modifyPilotLimit',
    ModifyStartingHandSize = 'modifyStartingHandSize',
    ModifyPower = 'modifyPower',
    ModifyStats = 'modifyStats',
    MultiplyNumericKeyword = 'multiplyNumericKeyword',
    MustAttack = 'mustAttack',
    MustBeChosen = 'mustBeChosen',
    NoMulligan = 'noMulligan',
    PrintedAttributesOverride = 'printedAttributesOverride',
    SetPower = 'setPower',
    ShowTopCard = 'showTopCard',
    SuppressEffects = 'suppressEffects',
    TakeControl = 'takeControl',
    TokenUnitsEnterPlayReady = 'tokenUnitsEnterPlayReady',
    UnlessActionCost = 'unlessActionCost',
    UpgradeHpModifier = 'upgradeHpModifier',
    UpgradePowerModifier = 'upgradePowerModifier',

    // "cannot" effects
    CannotApplyLastingEffects = 'cannotApplyLastingEffects',
    CannotAttackBase = 'cannotAttackBase',
    CannotAttack = 'cannotAttack',
}

export enum Duration {
    Custom = 'custom',
    Persistent = 'persistent',
    UntilEndOfAttack = 'untilEndOfAttack',
    UntilEndOfPhase = 'untilEndOfPhase',
    UntilEndOfRound = 'untilEndOfRound',
    WhileSourceInPlay = 'whileSourceInPlay'
}

export enum Stage {
    Cost = 'cost',
    Effect = 'effect',
    PreTarget = 'preTarget',
    Target = 'target',
    Trigger = 'trigger'
}

export enum RelativePlayer {
    Self = 'self',
    Opponent = 'opponent'
}

export enum WildcardRelativePlayer {
    Any = 'any'
}

export type RelativePlayerFilter = RelativePlayer | WildcardRelativePlayer;

export enum StandardTriggeredAbilityType {
    OnAttack = 'onAttack',
    WhenDefeated = 'whenDefeated',
    WhenPlayed = 'whenPlayed',
    WhenPlayedUsingSmuggle = 'whenPlayedUsingSmuggle',
}

export enum TargetMode {
    AutoSingle = 'autoSingle',
    // TODO: add 'Between'
    BetweenVariable = 'betweenVariable',
    DropdownList = 'dropdownList',
    Exactly = 'exactly',
    ExactlyVariable = 'exactlyVariable',
    MaxStat = 'maxStat',
    MultiplePlayers = 'multiplePlayers',
    Player = 'player',
    Select = 'select',
    Single = 'single',
    Unlimited = 'unlimited',
    UpTo = 'upTo',
    UpToVariable = 'upToVariable'
}

export enum PhaseName {
    Setup = 'setup',
    Action = 'action',
    Regroup = 'regroup'
}

export enum CardType {
    Base = 'base',

    /** non-leader, non-token unit */
    BasicUnit = 'basicUnit',

    /** non-token upgrade */
    BasicUpgrade = 'basicUpgrade',
    Event = 'event',
    Leader = 'leader',
    LeaderUnit = 'leaderUnit',
    LeaderUpgrade = 'leaderUpgrade',
    TokenUnit = 'tokenUnit',
    TokenUpgrade = 'tokenUpgrade',
    TokenCard = 'tokenCard',
    NonLeaderUnitUpgrade = 'nonLeaderUnitUpgrade',
}

export enum WildcardCardType {
    Any = 'any',
    NonLeaderUnit = 'nonLeaderUnit',
    NonLeaderUpgrade = 'nonLeaderUpgrade',
    NonUnit = 'nonUnit',
    /** Any card type that can be played from hand */
    Playable = 'playable',
    Token = 'token',

    /** Any unit type, including leader and token units */
    Unit = 'unit',

    /** Any upgrade type, including token upgrades */
    Upgrade = 'upgrade',

    UnitUpgrade = 'unitUpgrade',
}

export type CardTypeFilter = CardType | WildcardCardType;

export enum TokenUpgradeName {
    Experience = 'experience',
    Shield = 'shield'
}

export enum TokenUnitName {
    BattleDroid = 'battleDroid',
    CloneTrooper = 'cloneTrooper',
    XWing = 'xwing',
    TIEFighter = 'tieFighter',
}

export enum TokenCardName {
    Force = 'the-force'
}

export type TokenName = TokenUpgradeName | TokenUnitName | TokenCardName;

// TODO: start removing these if they aren't used
export enum EventName {
    OnAbilityResolved = 'onAbilityResolved',
    OnAbilityResolverInitiated = 'onAbilityResolverInitiated',
    OnActionTaken = 'onActionTaken',
    OnAddTokenToCard = 'onAddTokenToCard',
    OnAttackCompleted = 'onAttackCompleted',
    OnAttackDamageResolved = 'onAttackDamageResolved',
    OnAttackDeclared = 'onAttackDeclared',
    OnBeginRound = 'onBeginRound',
    OnBountyCollected = 'onBountyCollected',
    OnCardAbilityInitiated = 'onCardAbilityInitiated',
    OnCardAbilityTriggered = 'onCardAbilityTriggered',
    OnCardCaptured = 'onCardCaptured',
    OnCardDefeated = 'onCardDefeated',
    OnCardExhausted = 'onCardExhausted',
    OnCardLeavesPlay = 'onCardLeavesPlay',
    OnCardMoved = 'onCardMoved',
    OnCardPlayed = 'onCardPlayed',
    OnCardReadied = 'onCardReadied',
    OnCardResourced = 'onCardResourced',
    OnCardReturnedToHand = 'onCardReturnedToHand',
    OnCardRevealed = 'onCardRevealed',
    OnCardDiscarded = 'onCardDiscarded',
    OnCardsDiscardedFromHand = 'onCardsDiscardedFromHand',
    OnCardsDrawn = 'onCardsDrawn',
    OnClaimInitiative = 'onClaimInitiative',
    OnDamageDealt = 'onDamageDealt',
    OnDamageHealed = 'onDamageHealed',
    OnDeckSearch = 'onDeckSearch',
    OnDeckShuffled = 'onDeckShuffled',
    OnDiscardFromDeck = 'onDiscardFromDeck',
    OnEffectApplied = 'onEffectApplied',
    OnEntireHandDiscarded = 'onEntireHandDiscarded',
    OnExhaustResources = 'onExhaustResources',
    OnExploitUnits = 'onExploitUnits',
    OnForceUsed = 'onForceUsed',
    OnIndirectDamageDealtToPlayer = 'onIndirectDamageDealtToPlayer',
    OnInitiateAbilityEffects = 'onInitiateAbilityEffects',
    OnLeaderDeployed = 'onLeaderDeployed',
    OnLeaderFlipped = 'onLeaderFlipped',
    OnLookAtCard = 'onLookAtCard',
    OnLookMoveDeckCardsTopOrBottom = 'onLookMoveDeckCardsTopOrBottom',
    OnPassActionPhasePriority = 'onPassActionPhasePriority',
    OnPhaseCreated = 'onPhaseCreated',
    OnPhaseEnded = 'onPhaseEnded',
    OnPhaseEndedCleanup = 'onPhaseEndedCleanup',
    OnPhaseStarted = 'onPhaseStarted',
    OnReadyResources = 'onReadyResources',
    OnRescue = 'onRescue',
    OnRegroupPhaseReadyCards = 'onRegroupPhaseReadyCards',
    OnRoundEnded = 'onRoundEnded',
    OnRoundEndedCleanup = 'onRoundEndedCleanup',
    OnStatusTokenDiscarded = 'onStatusTokenDiscarded',
    OnStatusTokenGained = 'onStatusTokenGained',
    OnStatusTokenMoved = 'onStatusTokenMoved',
    OnTakeControl = 'onTakeControl',
    OnTokensCreated = 'OnTokensCreated',
    OnUnitEntersPlay = 'onUnitEntersPlay',
    OnUpgradeAttached = 'onUpgradeAttached',
    OnUpgradeUnattached = 'onUpgradeUnattached',
    OnUseWhenDefeated = 'onUseWhenDefeated',
    OnUseWhenPlayed = 'onUseWhenPlayed',
}

/**
 * Meta-events are infrastructure events that exist to facilitate game events.
 * Abilities cannot trigger on them because they don't exist in the SWU rules, they're just
 * to help us execute the game rules correctly.
 */
export enum MetaEventName {
    AttackSteps = 'attackSteps',
    Conditional = 'conditional',
    ChooseModalEffects = 'ChooseModalEffects',
    DistributeDamage = 'distributeDamage',
    DistributeIndirectDamageToCards = 'distributeIndirectDamageToCards',
    DistributeHealing = 'distributeHealing',
    DistributeExperience = 'distributeExperience',
    ExecuteHandler = 'executeHandler',
    InitiateAttack = 'initiateAttack',
    GameLost = 'gameLost',
    NoAction = 'noAction',
    Optional = 'optional',
    PayCardPrintedCost = 'payCardPrintedCost',
    PlayCard = 'playCard',
    RandomSelection = 'randomSelection',
    ReplacementEffect = 'replacementEffect',
    SelectCard = 'selectCard',
    SelectPlayer = 'selectPlayer',
    Sequential = 'sequential',
    Simultaneous = 'simultaneous',
}

export enum AbilityType {
    Action = 'action',
    Constant = 'constant',
    DelayedEffect = 'delayedEffect',
    Event = 'event',
    ReplacementEffect = 'replacementEffect',
    Triggered = 'triggered',
}

export enum Aspect {
    Aggression = 'aggression',
    Command = 'command',
    Cunning = 'cunning',
    Heroism = 'heroism',
    Vigilance = 'vigilance',
    Villainy = 'villainy',
}

export enum KeywordName {
    Ambush = 'ambush',
    Bounty = 'bounty',
    Coordinate = 'coordinate',
    Exploit = 'exploit',
    Grit = 'grit',
    Hidden = 'hidden',
    Overwhelm = 'overwhelm',
    Raid = 'raid',
    Restore = 'restore',
    Piloting = 'piloting',
    Saboteur = 'saboteur',
    Sentinel = 'sentinel',
    Shielded = 'shielded',
    Smuggle = 'smuggle',
}

export enum Trait {
    Armor = 'armor',
    Bounty = 'bounty',
    BountyHunter = 'bounty hunter',
    CapitalShip = 'capital ship',
    Clone = 'clone',
    Condition = 'condition',
    Creature = 'creature',
    Disaster = 'disaster',
    Droid = 'droid',
    Ewok = 'ewok',
    Fighter = 'fighter',
    FirstOrder = 'first order',
    Force = 'force',
    Fringe = 'fringe',
    Gambit = 'gambit',
    Gungan = 'gungan',
    Hutt = 'hutt',
    Imperial = 'imperial',
    Innate = 'innate',
    Inquisitor = 'inquisitor',
    Item = 'item',
    Jawa = 'jawa',
    Jedi = 'jedi',
    Kaminoan = 'kaminoan',
    Law = 'law',
    Learned = 'learned',
    Lightsaber = 'lightsaber',
    Mandalorian = 'mandalorian',
    Modification = 'modification',
    Naboo = 'naboo',
    NewRepublic = 'new republic',
    Night = 'night',
    Nihil = 'nihil',
    Official = 'official',
    Pilot = 'pilot',
    Plan = 'plan',
    Rebel = 'rebel',
    Republic = 'republic',
    Resistance = 'resistance',
    Separatist = 'separatist',
    Sith = 'sith',
    Spectre = 'spectre',
    Speeder = 'speeder',
    Supply = 'supply',
    Tactic = 'tactic',
    Tank = 'tank',
    Transport = 'transport',
    Trick = 'trick',
    Trooper = 'trooper',
    Twilek = 'twi\'lek',
    Underworld = 'underworld',
    Vehicle = 'vehicle',
    Walker = 'walker',
    Weapon = 'weapon',
    Wookiee = 'wookiee',
}

// TODO: these could stand to be reorganized and cleaned up a bit
// TODO: fix restrictions on players not being recognized by PlayerTargetResolver
export enum AbilityRestriction {

    /** Restricts a card from being declared as an attacker */
    Attack = 'attack',

    /** Restricts a card from being declared as an attack target */
    BeAttacked = 'beAttacked',

    /** Restricts a player's ability to play units */
    PlayUnit = 'playUnit',

    /** Restricts a player's ability to play upgrades */
    PlayUpgrade = 'playUpgrade',

    /** Restricts a player's ability to play events */
    PlayEvent = 'playEvent',

    /** Restricts a player's ability to put a certain card or type of card into play */
    PutIntoPlay = 'putIntoPlay',

    /** Restricts a card from being played. Typically used for event cards, see {@link AbilityRestriction.PutIntoPlay} for other card types */
    Play = 'play',

    /** Restricts a card or card type from being able to enter play. Typically used for non-events. See {@link AbilityRestriction.Play} for event cards */
    EnterPlay = 'enterPlay',

    /** Restricts a game object from being targetable by abilities */
    AbilityTarget = 'abilityTarget',

    BeHealed = 'beHealed',
    Exhaust = 'exhaust',
    InitiateKeywords = 'initiateKeywords',
    Ready = 'ready',
    DoesNotReadyDuringRegroup = 'doesNotReadyDuringRegroup',
    ReceiveDamage = 'receiveDamage',
    TriggerAbilities = 'triggerAbilities',
    BeCaptured = 'beCaptured',
    BeDefeated = 'beDefeated',
    ReturnToHand = 'returnToHand',
}

export enum StateWatcherName {
    AttacksThisPhase = 'attacksThisPhase',
    CardsDiscardedThisPhase = 'cardsDiscardedThisPhase',
    CardsDrawnThisPhase = 'cardsDrawnThisPhase',
    CardsEnteredPlayThisPhase = 'cardsEnteredPlayThisPhase',
    CardsLeftPlayThisPhase = 'cardsLeftPlayThisPhase',
    CardsPlayedThisPhase = 'cardsPlayedThisPhase',
    DamageDealtThisPhase = 'damageDealtThisPhase',
    ForceUsedThisPhase = 'forceUsedThisPhase',
    LeadersDeployedThisPhase = 'leadersDeployedThisPhase',
    UnitsDefeatedThisPhase = 'unitsDefeatedThisPhase',
    UnitsHealedThisPhase = 'unitsHealedThisPhase',

    // TODO STATE WATCHERS: watcher types needed
    // - unit defeated: Iden, Emperor's Legion, Brutal Traditions, Spark of Hope, Bravado
    // - damaged base: Cassian leader, Forced Surrender
    // - card played: Luke leader, Vader leader, Lothal Insurgent, Vanguard Ace, Guardian of the Whills, Relentless, Omega
    // - entered play: Boba unit
    // - attacked base: Ephant Mon, Rule with Respect
    // - attacked with unit type: Medal Ceremony, Bo-Katan leader, Asajj Ventress
}

/** For "canAffect" and target eligibility checks, indicates whether game state must be changed by the effect in order for the check to pass */
export enum GameStateChangeRequired {
    /** Game state change is not required */
    None = 'none',

    /**
     * Game state change is required but the effect is not required to fully resolve. E.g., if exhausting resources,
     * would not need to exhaust the full number of requested resources.
     */
    MustFullyOrPartiallyResolve = 'mustFullyOrPartiallyResolve',

    /**
     * Game state change is required and the effect is required to fully resolve. E.g., if exhausting resources,
     * would be required to exhaust the full number of requested resources.
     */
    MustFullyResolve = 'mustFullyResolve',
}

export enum SubStepCheck {
    None = 'none',
    /** ifYouDoNot is a special case which needs to ignore SubStep checks, but then and ifYouDo will do this check. */
    ThenIfYouDo = 'thenIfYouDo',
    All = 'all'
}

export enum AlertType {
    Notification = 'notification',
    Warning = 'warning',
    Danger = 'danger',
    ReadyStatus = 'readyStatus',
}
