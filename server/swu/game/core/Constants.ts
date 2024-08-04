export enum Locations {
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

// TODO: make enum names singular
export enum WildcardLocations {
    Any = 'any',
    AnyArena = 'any arena',
    AnyAttackable = 'any attackable'
}

export type TargetableLocations = Locations | WildcardLocations;

// TODO: where to put these helpers?
export const isArena = (location: TargetableLocations) => {
    switch (location) {
        case Locations.GroundArena:
        case Locations.SpaceArena:
        case WildcardLocations.AnyArena:
            return true;
        default:
            return false;
    }
}

export const isAttackableLocation = (location: TargetableLocations) => {
    switch (location) {
        case Locations.GroundArena:
        case Locations.SpaceArena:
        case WildcardLocations.AnyArena:
        case Locations.Base:
            return true;
        default:
            return false;
    }
}

// return true if the location matches one of the allowed location filters
export const cardLocationMatches = (cardLocation: Locations, allowedLocations: TargetableLocations | TargetableLocations[]) => {
    if (!Array.isArray(allowedLocations)) {
        allowedLocations = [allowedLocations];
    }

    return allowedLocations.some((allowedLocation) => {
        switch (allowedLocation) {
            case WildcardLocations.Any:
                return true;
            case WildcardLocations.AnyArena:
                return isArena(cardLocation);
            case WildcardLocations.AnyAttackable:
                return isAttackableLocation(cardLocation);
            default:
                return cardLocation === allowedLocation;
        }});
}

export enum PlayTypes {
    PlayFromHand = 'playFromHand',
    Smuggle = 'smuggle'
}

export enum StatType {
    Power = 'power',
    Hp = 'hp'
}

export enum EffectNames {
    AbilityRestrictions = 'abilityRestrictions',
    ChangeType = 'changeType',
    SuppressEffects = 'suppressEffects',
    ShowTopCard = 'showTopCard',
    EntersPlayForOpponent = 'entersPlayForOpponent',
    CostReducer = 'costReducer',
    CanPlayFromOutOfPlay = 'canPlayFromOutOfPlay',
    DoesNotReady = 'doesNotReady',
    Blank = 'blank',
    AddKeyword = 'addKeyword',
    LoseKeyword = 'loseKeyword',
    CopyCharacter = 'copyCharacter',    // currently unused
    GainAbility = 'gainAbility',
    CanBeTriggeredByOpponent = 'canBeTriggeredByOpponent',
    UnlessActionCost = 'unlessActionCost',
    MustBeChosen = 'mustBeChosen',
    TakeControl = 'takeControl',
    AdditionalAction = 'additionalActions',
    AdditionalActionAfterWindowCompleted = 'additionalActionsAfterWindowCompleted',
    AdditionalTriggerCost = 'additionalTriggercost',
    AdditionalPlayCost = 'additionalPlaycost',
    ModifyStats = 'modifyStats',
    ModifyPower = 'modifyPower',    // currently unused
    SetBasePower = 'setBasePower',  // currently unused
    SetPower = 'setPower',          // currently unused
    CalculatePrintedPower = 'calculatePrintedPower',    // currently unused
    ModifyHp = 'modifyHp',      // currently unused
    UpgradePowerModifier = 'upgradePowerModifier',
    UpgradeHpModifier = 'upgradeHpModifier',
    CanAttackGroundArenaFromSpaceArena = 'canAttackGroundArenaFromSpaceArena',
    CanAttackSpaceArenaFromGroundArena = 'canAttackSpaceArenaFromGroundArena'
}

export enum Durations {
    UntilEndOfPhase = 'untilendofphase',
    UntilEndOfRound = 'untilendofround',
    Persistent = 'persistent',
    Custom = 'custom'
}

export enum Stages {
    Cost = 'cost',
    Effect = 'effect',
    PreTarget = 'pretarget',
    Target = 'target'
}

export enum Players {
    Self = 'self',
    Opponent = 'opponent',
    Any = 'any'
}

export enum TargetModes {
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

export enum Phases {
    Action = 'action',
    Regroup = 'regroup'
}

export enum CardTypes {
    Unit = 'unit',
    Leader = 'leader',
    Base = 'base',
    Event = 'event',
    Upgrade = 'upgrade',
    Token = 'token'
}

export enum EventNames {
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
    OnAttackCompleted = 'onAttackCompleted',
}

export enum AbilityTypes {
    Action = 'action',
    WouldInterrupt = 'cancelinterrupt',
    ForcedInterrupt = 'forcedinterrupt',
    KeywordInterrupt = 'forcedinterrupt',
    Interrupt = 'interrupt',
    KeywordReaction = 'forcedreaction',
    ForcedReaction = 'forcedreaction',
    Reaction = 'reaction',
    Persistent = 'persistent',
    OtherEffects = 'OtherEffects'
}

export enum TokenTypes {
}

export enum Aspects {
    Heroism = 'heroism',
    Villainy = 'villainy',
    Aggression = 'aggression',
    Command = 'command',
    Cunning = 'cunning',
    Vigilance = 'vigilance'
}