import type { CardType, Trait } from '../Constants';
import { ZoneName } from '../Constants';
import type { Card } from '../card/Card';
import type { ICardWithUpgrades, IUpgradeCard } from '../card/CardInterfaces';
import type { Player } from '../Player';
import { Contract } from '../utils/Contract';
import type { GameEvent } from './GameEvent';
import type { Attack } from '../attack/Attack';
import type { CardRef } from '../lki/CardRef';

/** Records the "last known information" of a card before it left the arena, in case ability text needs to refer back to it. See SWU 8.12. */
export interface ILastKnownInformation {
    card: Card;
    title: string;
    controller: Player;
    arena: ZoneName;
    cost?: number;
    power?: number;
    hp?: number;
    type?: CardType;
    damage?: number;
    parentCard?: ICardWithUpgrades;
    upgrades?: IUpgradeCard[];
    traits: Set<Trait>;
    exhausted?: boolean;
    inPlayId?: number;
}

/**
 * Builds a snapshot of a card's current attributes. Intended to be called at the moment
 * the snapshot is needed (typically from a {@link addLastKnownInformationToEvent} pre-resolution
 * hook, just before the card's state is about to change).
 */
export function buildLastKnownInformation(card: Card): ILastKnownInformation {
    if (card.zoneName !== ZoneName.GroundArena && card.zoneName !== ZoneName.SpaceArena) {
        return {
            card,
            title: card.title,
            cost: card.hasCost() ? card.cost : undefined,
            controller: card.controller,
            arena: card.zoneName,
            traits: card.traits
        };
    }
    Contract.assertTrue(card.canBeInPlay());

    if (card.isUnit() && !card.isAttached()) {
        return {
            card,
            title: card.title,
            cost: card.cost,
            power: card.getPower(),
            hp: card.getHp(),
            type: card.type,
            arena: card.zoneName,
            controller: card.controller,
            damage: card.damage,
            upgrades: card.upgrades,
            traits: card.traits,
            exhausted: card.exhausted,
            inPlayId: card.isInPlay() ? card.inPlayId : card.mostRecentInPlayId,
        };
    }

    if (card.isUpgrade()) {
        return {
            card,
            title: card.title,
            cost: card.cost,
            power: card.getPower(),
            hp: card.getHp(),
            type: card.type,
            arena: card.zoneName,
            controller: card.controller,
            parentCard: card.parentCard,
            traits: card.traits,
            inPlayId: card.isInPlay() ? card.inPlayId : card.mostRecentInPlayId,
        };
    }

    Contract.fail(`Unexpected card type: ${card.type}`);
}

/**
 * Registers a pre-resolution hook on `event` that captures `card`'s last known information
 * onto `event.lastKnownInformation`. The snapshot is taken right before the event's
 * EventWindow resolves its events, so the captured state reflects the card immediately
 * before any in-window changes (e.g. defeat from damage events sharing the same window).
 *
 * Use this for events the card may well **survive**, such as damage. It writes no registry record,
 * because a record means "this incarnation is gone" — see {@link addDepartureRecordToEvent}.
 *
 * TODO (LKI migration phase 4): delete this. It exists only to serve the legacy
 * `event.lastKnownInformation` struct for events that are not departures, and its sole caller —
 * `DamageSystem.updateEvent` — is itself slated for removal, leaving
 * {@link addDepartureRecordToEvent} as the only helper. See
 * design/lki-migration-register.md §D.1.
 */
export function addLastKnownInformationToEvent(event: GameEvent, card: Card): void {
    event.setPreResolutionEffect((event) => {
        event.setLastKnownInformation(buildLastKnownInformation(card), refFor(event, card));
    });
}

/**
 * As {@link addLastKnownInformationToEvent}, but also writes a registry record.
 *
 * Only for events that actually remove the card from its zone. Recording for an event the card
 * survives would freeze a live unit at its pre-event values for the rest of the action, and would
 * then tombstone its still-current incarnation at the action boundary.
 */
export function addDepartureRecordToEvent(event: GameEvent, card: Card): void {
    event.setPreResolutionEffect((event) => {
        const info = buildLastKnownInformation(card);
        event.context.game.lkiRegistry.recordPending(event.eventId, card);
        event.setLastKnownInformation(info, refFor(event, card));
    });
}

/**
 * Captures last known information onto an event **synchronously**.
 *
 * For synthetic events that never enter an `EventWindow`, so no pre-resolution hook would ever run.
 */
export function addLastKnownInformationNow(event: GameEvent, card: Card): void {
    event.setLastKnownInformation(buildLastKnownInformation(card), refFor(event, card));
}

/**
 * The reference naming the incarnation `card` is in right now.
 *
 * Resolved at capture time rather than lazily, because the card may leave play and come back, or
 * move into a hidden zone, before anything reads the event — resolving it later would then name the
 * wrong incarnation (SC-13, invariant I2).
 */
function refFor(event: GameEvent, card: Card): CardRef {
    return event.context.game.lkiRegistry.refFor(card);
}

/**
 * Registers a pre-resolution hook on `event` that captures the attacker's and defender's last known information
 * onto `event.attackerLastKnownInformation` and `event.defendersLastKnownInformation`, respectively. The snapshot
 * is taken right before the event's EventWindow resolves its events, so the captured state reflects the attacker
 * and defender immediately before any in-window changes (e.g. defeat from damage events sharing the same window).
 */
export function addAttackLastKnownInformationToEvent(event: GameEvent, attack: Attack): void {
    event.setPreResolutionEffect(buildAttackLastKnownInformationHandler(attack));
}

/**
 * Builds a handler that captures the attacker's and defender's last known information onto
 * `event.attackerLastKnownInformation` and `event.defendersLastKnownInformation`. Intended
 * for cases where the capture needs to be composed with other logic inside a single pre-resolution
 * hook.
 */
export function buildAttackLastKnownInformationHandler(attack: Attack): (event) => void {
    return (event) => {
        event.attackerLastKnownInformation = buildLastKnownInformation(attack.attacker);
        event.defendersLastKnownInformation = attack.getLegalTargets().map((target) => buildLastKnownInformation(target));
    };
}
