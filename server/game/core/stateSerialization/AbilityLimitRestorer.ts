import { PerGameAbilityLimit, PerPlayerPerGameAbilityLimitBase, UnlimitedAbilityLimit } from '../ability/AbilityLimit';
import type { Card } from '../card/Card';
import { LeaderUnitCard } from '../card/LeaderUnitCard';
import type { Player } from '../Player';
import { MatchLoadError } from './MatchLoadError';
import type { ISavedAbilityLimit } from './SavedMatchInterfaces';
import { getLimitBearingAbilitySurface } from './SharedAbilitySurface';

/** No real game reaches anywhere near this many uses of one ability; a document claiming more (including `Infinity`, which would otherwise loop forever) is corrupt or hostile input, not a large-but-legitimate count. */
const MAX_PLAUSIBLE_LIMIT_USE_COUNT = 10_000;

function assertPlausibleUseCount(count: unknown, describe: () => string): asserts count is number {
    if (!Number.isInteger(count) || (count as number) < 0 || (count as number) > MAX_PLAUSIBLE_LIMIT_USE_COUNT) {
        throw new MatchLoadError(`${describe()} must be an integer in [0, ${MAX_PLAUSIBLE_LIMIT_USE_COUNT}]; found ${JSON.stringify(count)}.`);
    }
}

/**
 * The single authority for every ability-limit count, including `epicDeployUsed`. Derives its ability
 * surface from the same {@link getLimitBearingAbilitySurface} the writer uses, so the two can never
 * disagree about which abilities carry serializable limits.
 *
 * Applies each saved limit by `reset()` then `increment(player)` × count -- there is no dedicated setter on
 * `AbilityLimit`, so nothing else can write a use count out of band, and `EpicActionLimit.reset()`'s
 * deliberate no-op is harmless here because a freshly constructed limit is already `0`.
 */
export function restoreCardAbilityLimits(card: Card, saved: readonly ISavedAbilityLimit[], playerBySeat: ReadonlyMap<string, Player>): void {
    const surfaceByIdentifier = new Map(getLimitBearingAbilitySurface(card).map((ability) => [ability.abilityIdentifier, ability]));
    const deployEpicActionLimit = card instanceof LeaderUnitCard ? card.deployEpicActionLimit : null;

    for (const entry of saved) {
        const ability = surfaceByIdentifier.get(entry.abilityIdentifier);
        if (ability == null) {
            throw new MatchLoadError(`Card "${card.internalName}" has no ability with identifier "${entry.abilityIdentifier}" (unknown ability identifier).`);
        }

        const limit = ability.limit;
        if (limit == null || limit instanceof UnlimitedAbilityLimit) {
            throw new MatchLoadError(`Ability "${entry.abilityIdentifier}" on "${card.internalName}" has no serializable limit target (null or unlimited).`);
        }
        if (deployEpicActionLimit != null && limit === deployEpicActionLimit) {
            throw new MatchLoadError(`Document names the leader's own deploy limit ("${entry.abilityIdentifier}") among "${card.internalName}"'s ability limits; that limit is represented by "epicDeployUsed" and must not appear here (it would double-count).`);
        }

        limit.reset();

        if ('usesByPlayer' in entry) {
            if (!(limit instanceof PerPlayerPerGameAbilityLimitBase)) {
                throw new MatchLoadError(`Saved limit for "${entry.abilityIdentifier}" on "${card.internalName}" is player-keyed, but the live limit ("${limit.constructor.name}") is not.`);
            }
            for (const [seat, count] of Object.entries(entry.usesByPlayer)) {
                const player = playerBySeat.get(seat);
                if (player == null) {
                    throw new MatchLoadError(`Saved limit for "${entry.abilityIdentifier}" on "${card.internalName}" names seat "${seat}", which is not one of the loaded players.`);
                }
                assertPlausibleUseCount(count, () => `Saved limit for "${entry.abilityIdentifier}" on "${card.internalName}"'s usesByPlayer["${seat}"]`);
                for (let i = 0; i < count; i++) {
                    limit.increment(player);
                }
            }
        } else {
            if (!(limit instanceof PerGameAbilityLimit)) {
                throw new MatchLoadError(`Saved limit for "${entry.abilityIdentifier}" on "${card.internalName}" is per-game, but the live limit ("${limit.constructor.name}") is not.`);
            }
            assertPlausibleUseCount(entry.useCount, () => `Saved limit for "${entry.abilityIdentifier}" on "${card.internalName}"'s useCount`);
            for (let i = 0; i < entry.useCount; i++) {
                // PerGameAbilityLimit.increment ignores its argument; card.owner is passed only to satisfy the signature.
                limit.increment(card.owner);
            }
            if (entry.currentUserSeat != null) {
                const player = playerBySeat.get(entry.currentUserSeat);
                if (player == null) {
                    throw new MatchLoadError(`Saved limit for "${entry.abilityIdentifier}" on "${card.internalName}" names currentUserSeat "${entry.currentUserSeat}", which is not one of the loaded players.`);
                }
                limit.currentUser = player.name;
            }
        }
    }
}

/**
 * Restores the leader's own deploy-action epic-action-limit, identified by instance handle rather than by
 * walking action abilities (both of a pilot-capable leader's deploy actions share one limit instance).
 * `epicDeployUsed` on a non-`LeaderUnitCard` is a schema violation and rejects.
 */
export function restoreEpicDeployUsed(card: Card, epicDeployUsed: boolean, owner: Player): void {
    if (!epicDeployUsed) {
        return;
    }

    if (!(card instanceof LeaderUnitCard)) {
        throw new MatchLoadError(`"${card.internalName}" has epicDeployUsed: true, but it is not a deployable leader.`);
    }

    card.deployEpicActionLimit.increment(owner);
}
