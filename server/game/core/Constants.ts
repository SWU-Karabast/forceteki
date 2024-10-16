// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/lines-around-comment: off */

export enum Location {
    Base = 'base',
    Deck = 'deck',
    Discard = 'discard',
    GroundArena = 'ground arena',
    Hand = 'hand',
    OutsideTheGame = 'outside the game',
    RemovedFromGame = 'removed from game',
    Resource = 'resource',
    SpaceArena = 'space arena',
}

export enum WildcardLocation {
    Any = 'any',
    AnyArena = 'any arena',

    /** Any location that is a valid attack target - an arena or base zone */
    AnyAttackable = 'any attackable'
}

export type LocationFilter = Location | WildcardLocation;

export type Arena = Location.GroundArena | Location.SpaceArena;

export enum PlayType {
    PlayFromHand = 'playFromHand',
    Smuggle = 'smuggle'
}

export enum StatType {
    Hp = 'hp',
    Power = 'power'
}

export enum EffectName {
    AbilityRestrictions = 'abilityRestrictions',
    AdditionalAction = 'additionalActions',
    AdditionalActionAfterWindowCompleted = 'additionalActionsAfterWindowCompleted',
    AdditionalPlayCost = 'additionalPlaycost',
    AdditionalTriggerCost = 'additionalTriggercost',
    AddTrait = 'addTrait',
    Blank = 'blank',
    CanAttackGroundArenaFromSpaceArena = 'canAttackGroundArenaFromSpaceArena',
    CanAttackSpaceArenaFromGroundArena = 'canAttackSpaceArenaFromGroundArena',
    CanBeTriggeredByOpponent = 'canBeTriggeredByOpponent',
    CanPlayFromOutOfPlay = 'canPlayFromOutOfPlay',
    ChangeType = 'changeType',
    CostAdjuster = 'costAdjuster',
    DelayedEffect = 'delayedEffect',
    DoesNotReady = 'doesNotReady',
    DealsDamageBeforeDefender = 'dealsDamageBeforeDefender',
    EntersPlayForOpponent = 'entersPlayForOpponent',
    GainAbility = 'gainAbility',
    GainKeyword = 'gainKeyword',
    IncreaseLimitOnAbilities = 'increaseLimitOnAbilities',
    LoseKeyword = 'loseKeyword',
    LoseTrait = 'loseTrait',
    ModifyHp = 'modifyHp',
    ModifyPower = 'modifyPower',
    ModifyStats = 'modifyStats',
    MustBeChosen = 'mustBeChosen',
    SetPower = 'setPower',
    ShowTopCard = 'showTopCard',
    SuppressEffects = 'suppressEffects',
    TakeControl = 'takeControl',
    UnlessActionCost = 'unlessActionCost',
    UpgradeHpModifier = 'upgradeHpModifier',
    UpgradePowerModifier = 'upgradePowerModifier',

    // "cannot" effects
    CannotApplyLastingEffects = 'cannotApplyLastingEffects',
    CannotAttackBase = 'cannotAttackBase',
    CannotBeAttacked = 'cannotBeAttacked',
}

export enum Duration {
    Custom = 'custom',
    Persistent = 'persistent',
    UntilEndOfAttack = 'untilEndOfAttack',
    UntilEndOfPhase = 'untilEndOfPhase',
    UntilEndOfRound = 'untilEndOfRound',
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
    Opponent = 'opponent',
    Any = 'any'
}

export enum TargetMode {
    Ability = 'ability',
    AutoSingle = 'autoSingle',
    Exactly = 'exactly',
    ExactlyVariable = 'exactlyVariable',
    MaxStat = 'maxStat',
    Select = 'select',
    Single = 'single',
    Unlimited = 'unlimited',
    UpTo = 'upTo',
    UpToVariable = 'upToVariable'
}

export enum PhaseName {
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
    TokenUnit = 'tokenUnit',
    TokenUpgrade = 'tokenUpgrade',
}

export enum WildcardCardType {
    Any = 'any',
    NonLeaderUnit = 'nonLeaderUnit',
    Token = 'token',

    /** Any unit type, including leader and token units */
    Unit = 'unit',

    /** Any upgrade type, including token upgrades */
    Upgrade = 'upgrade',
}

export type CardTypeFilter = CardType | WildcardCardType;

export enum TokenName {
    Shield = 'shield',
    Experience = 'experience'
}

export enum EventName {
    MetaAttackSteps = 'metaAttackSteps',
    OnAbilityResolved = 'onAbilityResolved',
    OnAbilityResolverInitiated = 'onAbilityResolverInitiated',
    OnAddTokenToCard = 'onAddTokenToCard',
    OnAttackCompleted = 'onAttackCompleted',
    OnAttackDamageResolved = 'onAttackDamageResolved',
    OnAttackDeclared = 'onAttackDeclared',
    OnBeginRound = 'onBeginRound',
    OnCardAbilityInitiated = 'onCardAbilityInitiated',
    OnCardAbilityTriggered = 'onCardAbilityTriggered',
    OnCardDefeated = 'onCardDefeated',
    OnCardExhausted = 'onCardExhausted',
    OnCardLeavesPlay = 'onCardLeavesPlay',
    OnCardMoved = 'onCardMoved',
    OnCardPlayed = 'onCardPlayed',
    OnCardReadied = 'onCardReadied',
    OnCardReturnedToHand = 'onCardReturnedToHand',
    OnCardRevealed = 'onCardRevealed',
    OnCardsDiscarded = 'onCardsDiscarded',
    OnCardsDiscardedFromHand = 'onCardsDiscardedFromHand',
    OnCardsDrawn = 'onCardsDrawn',
    OnDamageDealt = 'onDamageDealt',
    OnDamageRemoved = 'onDamageRemoved',
    OnDeckSearch = 'onDeckSearch',
    OnDeckShuffled = 'onDeckShuffled',
    OnEffectApplied = 'onEffectApplied',
    onExhaustResources = 'onExhaustResources',
    OnInitiateAbilityEffects = 'onInitiateAbilityEffects',
    OnLeaderDeployed = 'onLeaderDeployed',
    OnLookAtCard = 'onLookAtCard',
    OnPassActionPhasePriority = 'onPassActionPhasePriority',
    OnPhaseCreated = 'onPhaseCreated',
    OnPhaseEnded = 'onPhaseEnded',
    OnPhaseEndedCleanup = 'onPhaseEndedCleanup',
    OnPhaseStarted = 'onPhaseStarted',
    OnReadyResources = 'onReadyResources',
    OnRegroupPhaseReadyCards = 'onRegroupPhaseReadyCards',
    OnRoundEnded = 'onRoundEnded',
    OnRoundEndedCleanup = 'onRoundEndedCleanup',
    OnScry = 'onScry',
    OnStatusTokenDiscarded = 'onStatusTokenDiscarded',
    OnStatusTokenGained = 'onStatusTokenGained',
    OnStatusTokenMoved = 'onStatusTokenMoved',
    OnClaimInitiative = 'onClaimInitiative',
    OnUnitEntersPlay = 'onUnitEntersPlay',
    OnUpgradeAttached = 'onUpgradeAttached',
    Unnamed = 'unnamedEvent',
}

export enum AbilityType {
    Action = 'action',
    Constant = 'constant',
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

    /** @deprecated Not implemented yet */
    Bounty = 'bounty',
    Grit = 'grit',
    Overwhelm = 'overwhelm',
    Raid = 'raid',
    Restore = 'restore',
    Saboteur = 'saboteur',
    Sentinel = 'sentinel',
    Shielded = 'shielded',
    Smuggle = 'smuggle',
}

/** List of keywords that don't have any additional parameters */
export type NonParameterKeywordName =
  | KeywordName.Ambush
  | KeywordName.Grit
  | KeywordName.Overwhelm
  | KeywordName.Saboteur
  | KeywordName.Sentinel
  | KeywordName.Shielded;

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
    Fighter = 'fighter',
    FirstOrder = 'first order',
    Force = 'force',
    Fringe = 'fringe',
    Gambit = 'gambit',
    Hutt = 'hutt',
    Imperial = 'imperial',
    Innate = 'innate',
    Inquisitor = 'inquisitor',
    Item = 'item',
    Jawa = 'jawa',
    Jedi = 'jedi',
    Law = 'law',
    Learned = 'learned',
    Lightsaber = 'lightsaber',
    Mandalorian = 'mandalorian',
    Modification = 'modification',
    NewRepublic = 'new republic',
    Official = 'official',
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
    Target = 'target',  // TODO: rename to AbilityTarget

    BeHealed = 'beHealed',
    Exhaust = 'exhaust',
    InitiateKeywords = 'initiateKeywords',
    Ready = 'ready',
    ReceiveDamage = 'receiveDamage',
    TriggerAbilities = 'triggerAbilities',
}

export enum StateWatcherName {
    AttacksThisPhase = 'attacksThisPhase',
    CardsLeftPlayThisPhase = 'cardsLeftPlayThisPhase',
    CardsPlayedThisPhase = 'cardsPlayedThisPhase',
    UnitsDefeatedThisPhase = 'unitsDefeatedThisPhase',
    CardsEnteredPlayThisPhase = 'cardsEnteredPlayThisPhase',

    // TODO STATE WATCHERS: watcher types needed
    // - unit defeated: Iden, Emperor's Legion, Brutal Traditions, Spark of Hope, Bravado
    // - damaged base: Cassian leader, Forced Surrender
    // - card played: Luke leader, Vader leader, Lothal Insurgent, Vanguard Ace, Guardian of the Whills, Relentless, Omega
    // - entered play: Boba unit
    // - attacked base: Ephant Mon, Rule with Respect
    // - attacked with unit type: Medal Ceremony, Bo-Katan leader, Asajj Ventress
    // - discarded: Kylo's TIE Silencer?
}
