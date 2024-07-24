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
    AnyArena = 'any arena'
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
            default:
                return cardLocation === allowedLocation;
        }});
}

export enum PlayTypes {
    PlayFromHand = 'playFromHand',
    Smuggle = 'smuggle'
}

export enum EffectNames {
    AbilityRestrictions = 'abilityRestrictions',
    ChangeType = 'changeType',
    SuppressEffects = 'suppressEffects',
    ShowTopCard = 'showTopCard',
    EntersPlayForOpponent = 'entersPlayForOpponent',
    CostReducer = 'costReducer',
    CanPlayFromOutOfPlay = 'canPlayFromOutOfPlay',
    DoesNotReady = 'doesnotready',
    Blank = 'blank',
    AddKeyword = 'addkeyword',
    LoseKeyword = 'losekeyword',
    CopyCharacter = 'copycharacter',
    GainAbility = 'gainability',
    CanBeTriggeredByOpponent = 'canbetriggeredbyopponent',
    UnlessActionCost = 'unlessactioncost',
    MustBeChosen = 'mustbechosen',
    TakeControl = 'takecontrol',
    AdditionalAction = 'additionalaction',
    AdditionalActionAfterWindowCompleted = 'additionalactionafterwindowcompleted',
    AdditionalTriggerCost = 'additionaltriggercost',
    AdditionalPlayCost = 'additionalplaycost',
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
    OnCardLeavesPlay = 'onCardLeavesPlay',
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