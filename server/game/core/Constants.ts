// allow block comments without spaces so we can have compact jsdoc descriptions in this file
/* eslint @stylistic/js/lines-around-comment: off */

export enum Location {
    Base = 'base',
    Deck = 'deck',
    Discard = 'discard',
    GroundArena = 'ground arena',
    Hand = 'hand',
    Leader = 'leader',
    OutsideTheGame = 'outside the game',
    RemovedFromGame = 'removed from game',
    Resource = 'resource',
    SpaceArena = 'space arena',
}

export enum WildcardLocation {
    Any = 'any',
    AnyArena = 'any arena',

    // TODO: better name for this?
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
    EffectTmp = 'effect',
    PreTarget = 'preTarget',
    Target = 'target'
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
    Token = 'token',
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
    Unit = 'unit',
    Upgrade = 'upgrade',
}

export type CardTypeFilter = CardType | WildcardCardType;

export enum TokenName {
    Shield = 'shield',
    Experience = 'experience'
}

export enum EventName {
    OnAbilityResolved = 'onAbilityResolved',
    OnAbilityResolverInitiated = 'onAbilityResolverInitiated',
    OnAddTokenToCard = 'onAddTokenToCard',
    OnAttackCompleted = 'onAttackCompleted',
    OnAttackDeclared = 'onAttackDeclared',
    OnBeginRound = 'onBeginRound',
    OnCardAbilityInitiated = 'onCardAbilityInitiated',
    OnCardAbilityTriggered = 'onCardAbilityTriggered',
    OnCardDefeated = 'onCardDefeated',
    OnCardExhausted = 'onCardExhausted',
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
    OnInitiateAbilityEffects = 'onInitiateAbilityEffects',
    OnLookAtCard = 'onLookAtCard',
    OnPassActionPhasePriority = 'onPassActionPhasePriority',
    OnPhaseCreated = 'onPhaseCreated',
    OnPhaseEnded = 'onPhaseEnded',
    OnPhaseEndedCleanup = 'onPhaseEndedCleanup',
    OnPhaseStarted = 'onPhaseStarted',
    OnRegroupPhaseReadyCards = 'onRegroupPhaseReadyCards',
    OnRoundEnded = 'onRoundEnded',
    OnRoundEndedCleanup = 'onRoundEndedCleanup',
    OnSpendResources = 'onSpendResources',
    OnStatusTokenDiscarded = 'onStatusTokenDiscarded',
    OnStatusTokenGained = 'onStatusTokenGained',
    OnStatusTokenMoved = 'onStatusTokenMoved',
    OnTakeInitiative = 'onTakeInitiative',
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
    /** @deprecated Not implemented yet */
    Ambush = 'ambush',
    /** @deprecated Not implemented yet */
    Bounty = 'bounty',
    Grit = 'grit',
    /** @deprecated Not implemented yet */
    Overwhelm = 'overwhelm',
    Raid = 'raid',
    Restore = 'restore',
    /** @deprecated Not implemented yet */
    Saboteur = 'saboteur',
    Sentinel = 'sentinel',
    Shielded = 'shielded',
    /** @deprecated Not implemented yet */
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
    InitiateKeywords = 'initiateKeywords',
    Ready = 'ready',
    ReceiveDamage = 'receiveDamage',
    TriggerAbilities = 'triggerAbilities',
}