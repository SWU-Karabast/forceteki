import type { EventName } from '../Constants';
import type { Card } from '../card/Card';
import type { Player } from '../Player';
import type { IOnPhaseEndedCleanupEvent, IOnPhaseEndedEvent, IOnPhaseStartedEvent } from '../gameSteps/phases/PhaseEventTypes';

/**
 * Properties present on every game event, added by {@link GameSystem.addPropertiesToEvent}.
 * Extend this interface (or {@link ICardEvent}) when defining a typed event payload.
 */
export interface IGameEventBase {
    player: Player;
}

/**
 * Properties present on all card-targeting events, added by {@link CardTargetSystem.addPropertiesToEvent}.
 * Extend this interface for events that always carry a primary `card` target.
 */
export interface ICardEvent extends IGameEventBase {
    card: Card;
}

/**
 * Maps every {@link EventName} to its typed event payload interface.
 *
 * All entries begin as `any` and are replaced incrementally as companion
 * `*EventTypes.ts` files are written alongside each game system.
 * See `TYPED_EVENTS.md` for the rollout plan and conversion priority order.
 *
 * IMPORTANT: every `EventName` value must have an explicit entry here.
 * Adding a new value to the `EventName` enum without adding a corresponding
 * entry will produce a TypeScript compile error.
 */
export interface GameEventTypeMap {
    [EventName.OnAbilityResolved]: any;
    [EventName.OnAbilityResolverInitiated]: any;
    [EventName.OnActionTaken]: any;
    [EventName.OnAddTokenToCard]: any;
    [EventName.OnAspectsDisclosed]: any;
    [EventName.OnAttackDamageResolved]: any;
    [EventName.OnAttackDeclared]: any;
    [EventName.OnAttackEnd]: any;
    [EventName.OnBeginRound]: any;
    [EventName.OnBountyCollected]: any;
    [EventName.OnCardAbilityInitiated]: any;
    [EventName.OnCardAbilityTriggered]: any;
    [EventName.OnCardCaptured]: any;
    [EventName.OnCardDefeated]: any;
    [EventName.OnCardDiscarded]: any;
    [EventName.OnCardExhausted]: any;
    [EventName.OnCardLeavesPlay]: any;
    [EventName.OnCardMoved]: any;
    [EventName.OnCardPlayed]: any;
    [EventName.OnCardReadied]: any;
    [EventName.OnCardResourced]: any;
    [EventName.OnCardReturnedToHand]: any;
    [EventName.OnCardRevealed]: any;
    [EventName.OnCardsDiscardedFromHand]: any;
    [EventName.OnCardsDrawn]: any;
    [EventName.OnClaimInitiative]: any;
    [EventName.OnDamageDealt]: any;
    [EventName.OnDamageHealed]: any;
    [EventName.OnDeckSearch]: any;
    [EventName.OnDeckShuffled]: any;
    [EventName.OnDefeatCreditsToPayCost]: any;
    [EventName.OnDiscardFromDeck]: any;
    [EventName.OnEffectApplied]: any;
    [EventName.OnEntireHandDiscarded]: any;
    [EventName.OnExhaustResources]: any;
    [EventName.OnExhaustUnitsToPayCost]: any;
    [EventName.OnExploitUnits]: any;
    [EventName.OnForceUsed]: any;
    [EventName.OnIndirectDamageDealtToPlayer]: any;
    [EventName.OnInitiateAbilityEffects]: any;
    [EventName.OnLeaderDeployed]: any;
    [EventName.OnLeaderFlipped]: any;
    [EventName.OnLookAtCard]: any;
    [EventName.OnLookMoveDeckCardsTopOrBottom]: any;
    [EventName.OnPassActionPhasePriority]: any;
    [EventName.OnPhaseEnded]: IOnPhaseEndedEvent;
    [EventName.OnPhaseEndedCleanup]: IOnPhaseEndedCleanupEvent;
    [EventName.OnPhaseStarted]: IOnPhaseStartedEvent;
    [EventName.OnReadyResources]: any;
    [EventName.OnRegroupPhaseReadyCards]: any;
    [EventName.OnRescue]: any;
    [EventName.OnRoundEnded]: any;
    [EventName.OnRoundEndedCleanup]: any;
    [EventName.OnStatusTokenDiscarded]: any;
    [EventName.OnStatusTokenGained]: any;
    [EventName.OnStatusTokenMoved]: any;
    [EventName.OnTakeControl]: any;
    [EventName.OnTokensCreated]: any;
    [EventName.OnUnitEntersPlay]: any;
    [EventName.OnUpgradeAttached]: any;
    [EventName.OnUpgradeUnattached]: any;
    [EventName.OnUseOnAttack]: any;
    [EventName.OnUseWhenDefeated]: any;
    [EventName.OnUseWhenPlayed]: any;
}
