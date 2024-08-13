export enum Location {
    Hand = 'hand',
    Deck = 'deck',
    Discard = 'discard',
    Base = 'base',
    Leader = 'leader',
    GroundArena = 'ground arena',
    SpaceArena = 'space arena',
    Resource = 'resource',
    RemovedFromGame = 'removed from game',
    OutsideTheGame = 'outside the game',
    BeingPlayed = 'being played',
}

export enum WildcardLocation {
    Any = 'any',
    AnyArena = 'any arena',
    AnyAttackable = 'any attackable'
}

export type LocationFilter = Location | WildcardLocation;

export enum PlayType {
    PlayFromHand = 'playFromHand',
    Smuggle = 'smuggle'
}

export enum StatType {
    Power = 'power',
    Hp = 'hp'
}

export enum EffectName {
    AbilityRestrictions = 'abilityRestrictions',
    ChangeType = 'changeType',
    SuppressEffects = 'suppressEffects',
    ShowTopCard = 'showTopCard',
    EntersPlayForOpponent = 'entersPlayForOpponent',
    CostAdjuster = 'costAdjuster',
    CanPlayFromOutOfPlay = 'canPlayFromOutOfPlay',
    DoesNotReady = 'doesNotReady',
    Blank = 'blank',
    AddKeyword = 'addKeyword',
    LoseKeyword = 'loseKeyword',
    CanBeTriggeredByOpponent = 'canBeTriggeredByOpponent',
    UnlessActionCost = 'unlessActionCost',
    MustBeChosen = 'mustBeChosen',
    TakeControl = 'takeControl',
    AdditionalAction = 'additionalActions',
    AdditionalActionAfterWindowCompleted = 'additionalActionsAfterWindowCompleted',
    AdditionalTriggerCost = 'additionalTriggercost',
    AdditionalPlayCost = 'additionalPlaycost',
    ModifyStats = 'modifyStats',
    ModifyPower = 'modifyPower',
    SetBasePower = 'setBasePower',
    SetPower = 'setPower',
    CalculatePrintedPower = 'calculatePrintedPower',
    ModifyHp = 'modifyHp',
    UpgradePowerModifier = 'upgradePowerModifier',
    UpgradeHpModifier = 'upgradeHpModifier',
    CanAttackGroundArenaFromSpaceArena = 'canAttackGroundArenaFromSpaceArena',
    CanAttackSpaceArenaFromGroundArena = 'canAttackSpaceArenaFromGroundArena',
    AddTrait = 'addTrait',
    LoseTrait = 'loseTrait',
    DelayedEffect = 'delayedEffect',
    IncreaseLimitOnAbilities = 'increaseLimitOnAbilities',
    LoseAllNonKeywordAbilities = 'loseAllNonKeywordAbilities',
    CannotApplyLastingEffects = 'cannotApplyLastingEffects',
    CannotBeAttacked = 'cannotBeAttacked',
    GainAbility = 'gainAbility'
}

export enum Duration {
    UntilEndOfPhase = 'untilEndOfPhase',
    UntilEndOfRound = 'untilEndOfRound',
    UntilEndOfAttack = 'untilEndOfAttack',
    Persistent = 'persistent',
    Custom = 'custom'
}

export enum Stage {
    Cost = 'cost',
    Effect = 'effect',
    PreTarget = 'preTarget',
    Target = 'target'
}

export enum RelativePlayer {
    Self = 'self',
    Opponent = 'opponent',
    Any = 'any'
}

export enum TargetMode {
    Select = 'select',
    Ability = 'ability',
    Token = 'token',
    AutoSingle = 'autoSingle',
    Exactly = 'exactly',
    ExactlyVariable = 'exactlyVariable',
    MaxStat = 'maxStat',
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
    Unit = 'unit',
    Leader = 'leader',
    Base = 'base',
    Event = 'event',
    Upgrade = 'upgrade',
    Token = 'token'
}

export enum EventName {
    OnBeginRound = 'onBeginRound',
    OnUnitEntersPlay = 'onUnitEntersPlay',
    OnInitiateAbilityEffects = 'onInitiateAbilityEffects',
    OnCardAbilityInitiated = 'onCardAbilityInitiated',
    OnCardAbilityTriggered = 'onCardAbilityTriggered',
    OnPhaseCreated = 'onPhaseCreated',
    OnPhaseStarted = 'onPhaseStarted',
    OnPhaseEnded = 'onPhaseEnded',
    OnRoundEnded = 'onRoundEnded',
    OnCardExhausted = 'onCardExhausted',
    OnCardReadied = 'onCardReadied',
    OnCardsDiscarded = 'onCardsDiscarded',
    OnCardsDiscardedFromHand = 'onCardsDiscardedFromHand',
    OnCardDefeated = 'onCardDefeated',
    OnAddTokenToCard = 'onAddTokenToCard',
    OnCardPlayed = 'onCardPlayed',
    OnDeckShuffled = 'onDeckShuffled',
    OnTakeInitiative = 'onTakeInitiative',
    OnAbilityResolved = 'onAbilityResolved',
    OnCardMoved = 'onCardMoved',
    OnDeckSearch = 'onDeckSearch',
    OnEffectApplied = 'onEffectApplied',
    OnStatusTokenDiscarded = 'onStatusTokenDiscarded',
    OnStatusTokenMoved = 'onStatusTokenMoved',
    OnStatusTokenGained = 'onStatusTokenGained',
    OnCardsDrawn = 'onCardsDrawn',
    OnLookAtCards = 'onLookAtCards',
    OnPassActionPhasePriority = 'onPassActionPhasePriority',
    Unnamed = 'unnamedEvent',
    OnAbilityResolverInitiated = 'onAbilityResolverInitiated',
    OnSpendResources = 'onSpendResources',
    OnAttackDeclared = 'onAttackDeclared',
    OnDamageDealt = 'onDamageDealt',
    OnDamageRemoved = 'onDamageRemoved',
    OnAttackCompleted = 'onAttackCompleted',
    OnCardReturnedToHand = 'onCardReturnedToHand',
}

export enum AbilityType {
    Action = 'action',
    ForcedReaction = 'forcedReaction',
    Reaction = 'reaction',
    TriggeredAbility = 'triggeredAbility',
    Persistent = 'persistent',
    OtherEffects = 'otherEffects'
}

export enum Aspect {
    Heroism = 'heroism',
    Villainy = 'villainy',
    Aggression = 'aggression',
    Command = 'command',
    Cunning = 'cunning',
    Vigilance = 'vigilance'
}

export enum Trait {
    Force = 'force',
    Rebel = 'rebel',
    Imperial = 'imperial',
    Sith = 'sith',
    Trooper = 'trooper',
    Official = 'official',
    Vehicle = 'vehicle',
    Fighter = 'fighter',
    Innate = 'innate',
    Gambit = 'gambit',
    Underworld = 'underworld',
    Wookiee = 'wookiee',
    Jedi = 'jedi',
    Supply = 'supply',
    Tactic = 'tactic',
    Item = 'item',
    Weapon = 'weapon',
    Lightsaber = 'lightsaber',
    Separatist = 'separatist',
    Learned = 'learned',
    Armor = 'armor',
    FirstOrder = 'first order',
    Mandalorian = 'mandalorian',
    BountyHunter = 'bounty hunter',
    Droid = 'droid',
    Spectre = 'spectre',
    Walker = 'walker',
    Law = 'law',
    Creature = 'creature',
    Fringe = 'fringe',
    Plan = 'plan',
    Twilek = 'twi\'lek',
    Trick = 'trick',
    Clone = 'clone',
    Bounty = 'bounty',
    Condition = 'condition',
    Republic = 'republic',
    Speeder = 'speeder',
    Transport = 'transport',
    Disaster = 'disaster',
    CapitalShip = 'capital ship',
    Hutt = 'hutt',
    Tank = 'tank',
    Inquisitor = 'inquisitor',
    Jawa = 'jawa',
    NewRepublic = 'new republic',
    Modification = 'modification',
    Resistance = 'resistance'
}