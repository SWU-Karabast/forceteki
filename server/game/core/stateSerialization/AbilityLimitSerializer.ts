import { PerGameAbilityLimit, PerPlayerPerGameAbilityLimitBase, UnlimitedAbilityLimit } from '../ability/AbilityLimit';
import type { Card } from '../card/Card';
import { LeaderUnitCard } from '../card/LeaderUnitCard';
import type { Player } from '../Player';
import { getPristineAbilityIdentifiers } from './PristineAbilityIdentifiers';
import { SaveIntegrityError } from './SavedMatchInterfaces';
import type { ISavedAbilityLimit } from './SavedMatchInterfaces';
import { getLimitBearingAbilitySurface } from './SharedAbilitySurface';

export interface ISeatedPlayer {
    seat: string;
    player: Player;
}

/**
 * Serializes every non-trivial ability limit on `card` (per the shared surface in
 * {@link getLimitBearingAbilitySurface}), skipping the leader's own deploy limit (represented instead by
 * `epicDeployUsed`) and any `UnlimitedAbilityLimit` (unbounded, so its use count is not a serializable
 * limit — this mirrors AC11's reachability assertion, which is scoped to non-`UnlimitedAbilityLimit`
 * limits for the same reason).
 *
 * Before emitting an identifier, this checks it against {@link getPristineAbilityIdentifiers} for the same
 * card class and card data. An identifier absent from that set means `Card.nextAbilityIdx` has drifted
 * between the pristine class definition and this live instance — the file's coordinates can no longer be
 * trusted — and a duplicate identifier among this card's own emitted limits means the same. Both throw
 * {@link SaveIntegrityError} rather than degrading. This is a **forward guard**, not a detector of an
 * existing drift mode: live and pristine derive from the same class and the same card data, so nothing in
 * the engine as it stands today can trip it; it remains falsifiable because `CardAbility.abilityIdentifier`
 * is only `readonly` at compile time.
 */
export function serializeAbilityLimitsForCard(card: Card, seatedPlayers: readonly ISeatedPlayer[]): ISavedAbilityLimit[] {
    const pristineIdentifiers = getPristineAbilityIdentifiers(card);
    const emittedIdentifiers = new Set<string>();
    const entries: ISavedAbilityLimit[] = [];

    // The two deploy actions on a LeaderUnitCard share one EpicActionLimit instance, so exclusion is by
    // instance identity rather than by ability.
    const deployEpicActionLimit = card instanceof LeaderUnitCard ? card.deployEpicActionLimit : null;

    for (const ability of getLimitBearingAbilitySurface(card)) {
        const limit = ability.limit;

        if (limit == null || limit instanceof UnlimitedAbilityLimit) {
            continue;
        }
        if (deployEpicActionLimit != null && limit === deployEpicActionLimit) {
            continue;
        }

        if (!pristineIdentifiers.has(ability.abilityIdentifier)) {
            throw new SaveIntegrityError(
                `Card "${card.internalName}" is about to emit ability limit identifier "${ability.abilityIdentifier}", which no pristine instance of its class would mint. This indicates Card.nextAbilityIdx coordinate drift; refusing to save an untrustworthy coordinate.`
            );
        }
        if (emittedIdentifiers.has(ability.abilityIdentifier)) {
            throw new SaveIntegrityError(
                `Card "${card.internalName}" would emit duplicate ability limit identifier "${ability.abilityIdentifier}" among its own limits.`
            );
        }
        emittedIdentifiers.add(ability.abilityIdentifier);

        if (limit instanceof PerGameAbilityLimit) {
            const useCount = limit.currentForPlayer();
            if (useCount !== 0) {
                entries.push({ abilityIdentifier: ability.abilityIdentifier, useCount, currentUserSeat: null });
            }
        } else if (limit instanceof PerPlayerPerGameAbilityLimitBase) {
            const usesByPlayer: Record<string, number> = {};
            for (const { seat, player } of seatedPlayers) {
                const count = limit.currentForPlayer(player);
                if (count !== 0) {
                    usesByPlayer[seat] = count;
                }
            }
            if (Object.keys(usesByPlayer).length > 0) {
                entries.push({ abilityIdentifier: ability.abilityIdentifier, usesByPlayer });
            }
        } else {
            // Exhaustive today (AbilityLimit's only concrete subclasses are UnlimitedAbilityLimit, skipped
            // above, PerGameAbilityLimit, and PerPlayerPerGameAbilityLimitBase), but this must throw
            // SaveIntegrityError rather than Contract.fail: the writer's stated error contract is that a
            // refused save can never halt the live match via Game.reportError, and a future AbilityLimit
            // subclass reaching this branch must degrade that contract, not violate it.
            throw new SaveIntegrityError(`Unsupported AbilityLimit subclass "${limit.constructor.name}" encountered while serializing limits for card "${card.internalName}"`);
        }
    }

    return entries;
}
