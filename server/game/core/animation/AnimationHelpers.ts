import { DamageType } from '../Constants';
import { DamageSourceType } from '../../IDamageOrDefeatSource';
import type { Card } from '../card/Card';

/**
 * Shared lookups for animation descriptors. Everything here reads engine events defensively:
 * an animation must never be able to interrupt a game action, so a malformed event resolves
 * to `undefined` rather than throwing.
 */

/**
 * Resolves the card responsible for a damage event.
 *
 * Mirrors the branching in `DamageDealtThisPhaseWatcher`, with one addition: that watcher has no
 * case for `DamageType.Excess` and leaves the source empty for it, so excess damage walks back to
 * the event that produced the overflow.
 */
export function resolveDamageSourceCard(event: any): Card | undefined {
    const damageSource = event?.damageSource;

    switch (event?.type) {
        case DamageType.Combat:
            // NOT `attack.attacker`: in an attack both units deal damage, so the attacker is the
            // source of only one of the two records. `damageDealtBy` is the list of units dealing
            // THIS damage — the defender for the return hit — and is plural because several
            // defenders can strike back at once.
            return damageSource?.damageDealtBy?.[0];

        case DamageType.Overwhelm:
            return damageSource?.attack?.attacker;

        case DamageType.Excess:
            // Excess damage carries no source of its own; it belongs to the event that overflowed.
            return resolveDamageSourceCard(event.sourceEventForExcessDamage);

        default:
            break;
    }

    if (damageSource?.type === DamageSourceType.Attack) {
        return damageSource.attack?.attacker;
    }

    if (damageSource?.type === DamageSourceType.Ability) {
        return damageSource.card;
    }

    // Last resort: the ability that is resolving.
    return event?.context?.source;
}

/**
 * Who defeated the card. Kept local rather than calling `DefeatCardSystem.defeatSourceCard`
 * because that helper asserts on the event name and throws on a malformed source.
 */
export function resolveDefeatSourceCard(event: any): Card | undefined {
    const defeatSource = event?.defeatSource;
    if (defeatSource == null) {
        return undefined;
    }

    if (defeatSource.type === DamageSourceType.Attack) {
        return defeatSource.attack?.attacker;
    }

    return defeatSource.card;
}

/**
 * A card being defeated is only worth animating if it is a real card on the board.
 *
 * Token UPGRADES (shield, experience, advantage, weakness) are removed by being defeated, so they
 * arrive here too — a shield popping is its own animation with its own host-tracking problem, so
 * it is deliberately out of v1. Force and Credit tokens likewise. Token UNITS are real bodies in
 * an arena and must keep their defeat animation.
 */
export function isAnimatableDefeatTarget(card: Card | undefined): boolean {
    if (card == null) {
        return false;
    }
    return !card.isToken() || card.isTokenUnit();
}
