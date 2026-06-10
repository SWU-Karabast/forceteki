import type { CardType, Trait } from '../Constants';
import { ZoneName } from '../Constants';
import type { Card } from '../card/Card';
import type { IUnitCard } from '../card/propertyMixins/UnitProperties';
import type { IUpgradeCard } from '../card/CardInterfaces';
import type { Player } from '../Player';
import { Contract } from '../utils/Contract';
import type { GameEvent } from './GameEvent';
import type { Attack } from '../attack/Attack';

/** Records the "last known information" of a card before it left the arena, in case ability text needs to refer back to it. See SWU 8.12. */
export interface ILastKnownInformation {
    card: Card;
    title: string;
    controller: Player;
    arena: ZoneName;
    power?: number;
    hp?: number;
    type?: CardType;
    damage?: number;
    parentCard?: IUnitCard;
    upgrades?: IUpgradeCard[];
    traits: Set<Trait>;
    exhausted?: boolean;
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
            power: card.getPower(),
            hp: card.getHp(),
            type: card.type,
            arena: card.zoneName,
            controller: card.controller,
            damage: card.damage,
            upgrades: card.upgrades,
            traits: card.traits,
            exhausted: card.exhausted
        };
    }

    if (card.isUpgrade()) {
        return {
            card,
            title: card.title,
            power: card.getPower(),
            hp: card.getHp(),
            type: card.type,
            arena: card.zoneName,
            controller: card.controller,
            parentCard: card.parentCard,
            traits: card.traits
        };
    }

    Contract.fail(`Unexpected card type: ${card.type}`);
}

/**
 * Registers a pre-resolution hook on `event` that captures `card`'s last known information
 * onto `event.lastKnownInformation`. The snapshot is taken right before the event's
 * EventWindow resolves its events, so the captured state reflects the card immediately
 * before any in-window changes (e.g. defeat from damage events sharing the same window).
 */
export function addLastKnownInformationToEvent(event: GameEvent, card: Card): void {
    event.setPreResolutionEffect((event) => {
        event.lastKnownInformation = buildLastKnownInformation(card);
    });
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
