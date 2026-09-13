import { AbilityType, Duration, EffectName } from '../Constants';
import { PerGameAbilityLimit, PerPlayerPerGameAbilityLimitBase, UnlimitedAbilityLimit } from '../ability/AbilityLimit';
import type { AbilityLimit } from '../ability/AbilityLimit';
import type { CardAbility } from '../ability/CardAbility';
import { Card } from '../card/Card';
import type { LeaderUnitCard } from '../card/LeaderUnitCard';
import type { Game } from '../Game';
import type { GameObject } from '../GameObject';
import type { OngoingEffect } from '../ongoingEffect/OngoingEffect';
import { describeEffect } from '../ongoingEffect/OngoingEffectEngine';
import type { Player } from '../Player';
import type { IEngineOnlyFact, ISavedCardRef } from './SavedMatchInterfaces';
import type { ISeatedPlayer } from './AbilityLimitSerializer';

/** An `OngoingEffect`'s targets are typed as `GameObject`; in practice each is either a `Card` or a `Player`. */
function resolveTargetValue(
    target: GameObject,
    resolveCardRef: (card: Card) => ISavedCardRef,
    getSeatForPlayer: (player: Player) => string
): ISavedCardRef | string {
    return target instanceof Card ? resolveCardRef(target) : getSeatForPlayer(target as Player);
}

/**
 * Rules 1/2/5 are not documented as one-fact-per-target the way rule 4 is, so a multi-target effect
 * (uncommon at this unit's only legal save point, a mid-action-phase snapshot) is summarized as a joined
 * description rather than fanned out. A single target resolves to its own coordinate/seat; zero targets
 * resolves to `null`.
 */
function resolveMultiTargetValue(
    targets: readonly GameObject[],
    resolveCardRef: (card: Card) => ISavedCardRef,
    getSeatForPlayer: (player: Player) => string
): ISavedCardRef | string | null {
    if (targets.length === 0) {
        return null;
    }
    if (targets.length === 1) {
        return resolveTargetValue(targets[0], resolveCardRef, getSeatForPlayer);
    }
    return targets
        .map((target) => (target instanceof Card ? target.internalName : (target as Player).name))
        .join(', ');
}

function fallbackDescription(category: IEngineOnlyFact['category'], effect: OngoingEffect): string {
    return `${category} from ${effect.source.internalName}`;
}

function currentCountForEitherPlayer(limit: AbilityLimit, seatedPlayers: readonly ISeatedPlayer[]): number {
    if (limit instanceof PerGameAbilityLimit) {
        return limit.currentForPlayer();
    }
    if (limit instanceof PerPlayerPerGameAbilityLimitBase) {
        return Math.max(...seatedPlayers.map(({ player }) => limit.currentForPlayer(player)), 0);
    }
    return 0;
}

/**
 * The dropped-count rule: a re-derivable gain-ability effect (suppressed by rule 3 because the engine has
 * already proven its granting constant ability is live) still loses its granted ability's **use count** on
 * load, because `gained_from_<sourceAbilityIdentifier>` is not a coordinate the schema can key on (two
 * abilities gained by one card from the same source share it — `GainAbility`'s own documented TODO). This
 * records that loss as a `gainedAbility` fact whenever the located granted ability's count is provably
 * nonzero, or unconditionally when the target is blanked (a blanked target's ability list can't prove the
 * count is zero, and concluding "no count lost" from an unreadable list would be exactly the silent
 * degradation this rule exists to prevent).
 */
function buildDroppedCountFacts(
    effect: OngoingEffect,
    resolveCardRef: (card: Card) => ISavedCardRef,
    seatedPlayers: readonly ISeatedPlayer[]
): IEngineOnlyFact[] {
    const valueWrapper = effect.impl.valueWrapper;
    if (!valueWrapper.isGainAbility()) {
        return [];
    }

    // Constant and DamageModification grants carry no limit, so no scan is needed.
    if (valueWrapper.abilityType === AbilityType.Constant || valueWrapper.abilityType === AbilityType.DamageModification) {
        return [];
    }

    const grantingAbilityIdentifier = (effect.ongoingEffect as { abilityIdentifier?: string } | undefined)?.abilityIdentifier;
    const expectedIdentifier = grantingAbilityIdentifier ? `gained_from_${grantingAbilityIdentifier}` : null;

    const facts: IEngineOnlyFact[] = [];

    for (const target of effect.targets) {
        if (!(target instanceof Card)) {
            continue;
        }

        // A blanked target returns only epic actions from getActionAbilities(), so the writer cannot prove
        // the count is zero and emits the fact unconditionally rather than guessing.
        if (target.isBlank()) {
            facts.push({
                category: 'gainedAbility',
                source: resolveCardRef(effect.source),
                target: resolveCardRef(target),
                duration: effect.duration ?? null,
                description: `${target.internalName} may retain a use-count for an ability gained from ${effect.source.internalName} that cannot be confirmed while the target is blanked; the count is not preserved on load.`,
            });
            continue;
        }

        const candidateAbilities: CardAbility[] = [...target.getActionAbilities()];
        if (target.canRegisterTriggeredAbilities()) {
            candidateAbilities.push(...target.getTriggeredAbilities());
        }

        const grantedAbility = candidateAbilities.find((ability) =>
            ability.printedAbility === false &&
            (expectedIdentifier ? ability.abilityIdentifier === expectedIdentifier : ability.gainAbilitySource === effect.source));

        if (!grantedAbility || grantedAbility.limit == null || grantedAbility.limit instanceof UnlimitedAbilityLimit) {
            continue;
        }

        if (currentCountForEitherPlayer(grantedAbility.limit, seatedPlayers) > 0) {
            facts.push({
                category: 'gainedAbility',
                source: resolveCardRef(effect.source),
                target: resolveCardRef(target),
                duration: effect.duration ?? null,
                description: `${target.internalName} keeps an ability gained from ${effect.source.internalName} on load, but its use count is not preserved.`,
            });
        }
    }

    return facts;
}

/**
 * Classifies every effect in `game.ongoingEffectEngine.effects` into at most one `engineOnlyFacts` entry,
 * per the ordered rules established in the owning plan (rule 0 liveness, rules 1-2 delayed/custom, rule 3
 * structural re-derivability with the dropped-count carve-out, rule 4 gained, rule 5 lasting catch-all).
 * The order is load-bearing: rule 1 must precede rule 3 because `DelayedEffectSystem` defaults to
 * `Duration.Persistent`, and rule 3's own soundness depends on rule 0 having already run.
 */
export function classifyOngoingEffects(
    game: Game,
    resolveCardRef: (card: Card) => ISavedCardRef,
    getSeatForPlayer: (player: Player) => string,
    seatedPlayers: readonly ISeatedPlayer[]
): IEngineOnlyFact[] {
    const facts: IEngineOnlyFact[] = [];

    for (const effect of game.ongoingEffectEngine.effects) {
        // Rule 0: an inactive effect is doing nothing and loses nothing by not being enumerated. Deliberately
        // not `targets.length > 0`, which diverges for condition-gated persistent effects.
        if (!effect.isEffectActive()) {
            continue;
        }

        // Rule 1: a delayed effect, regardless of its own `duration` (DelayedEffectSystem defaults to
        // Duration.Persistent), must be taken before rule 3 can consider it.
        if (effect.impl.type === EffectName.DelayedEffect) {
            facts.push({
                category: 'delayedEffect',
                source: resolveCardRef(effect.source),
                target: resolveMultiTargetValue(effect.targets, resolveCardRef, getSeatForPlayer),
                duration: effect.duration ?? null,
                description: describeEffect(effect) ?? fallbackDescription('delayedEffect', effect),
            });
            continue;
        }

        // Rule 2: a custom-duration ("lasting effect until an event") effect shares the delayedEffect
        // category with rule 1; the published `duration` field ('custom') is what discriminates them.
        if (effect.duration === Duration.Custom) {
            facts.push({
                category: 'delayedEffect',
                source: resolveCardRef(effect.source),
                target: resolveMultiTargetValue(effect.targets, resolveCardRef, getSeatForPlayer),
                duration: effect.duration ?? null,
                description: describeEffect(effect) ?? fallbackDescription('delayedEffect', effect),
            });
            continue;
        }

        // Rule 3 (the structural closure): a Persistent, non-lasting effect that survived rule 0 was
        // registered by a ConstantAbility whose liveness the engine has already proven (isEffectActive()'s
        // own check). It is re-derivable at load and emits no fact of its own, except for the dropped-count
        // carve-out on a gain-ability effect, which loses a use count even though it is re-derivable.
        if (effect.duration === Duration.Persistent && !effect.ongoingEffect.isLastingEffect) {
            if (effect.type === EffectName.GainAbility) {
                facts.push(...buildDroppedCountFacts(effect, resolveCardRef, seatedPlayers));
            }
            continue;
        }

        // Rule 4: a non-re-derivable gain-ability effect, one fact per (effect, target).
        if (effect.type === EffectName.GainAbility) {
            for (const target of effect.targets) {
                if (!(target instanceof Card)) {
                    continue;
                }
                facts.push({
                    category: 'gainedAbility',
                    source: resolveCardRef(effect.source),
                    target: resolveCardRef(target),
                    duration: effect.duration ?? null,
                    description: describeEffect(effect) ?? fallbackDescription('gainedAbility', effect),
                });
            }
            continue;
        }

        // Rule 5: everything still standing, as a catch-all rather than an enumeration.
        facts.push({
            category: 'lastingEffect',
            source: resolveCardRef(effect.source),
            target: resolveMultiTargetValue(effect.targets, resolveCardRef, getSeatForPlayer),
            duration: effect.duration ?? null,
            description: describeEffect(effect) ?? fallbackDescription('lastingEffect', effect),
        });
    }

    return facts;
}

/**
 * One `pilotLeader` fact per pilot-deployed leader (`deployed === true && isAttached()`), naming the host
 * unit it is attached to. Phase 2 emits such a leader as `deployed: false` at the `leader` singleton
 * position and omits it from its host's `upgrades`, so this fact is the only place the pilot attachment is
 * recorded.
 */
export function buildPilotLeaderFacts(
    pilotDeployedLeaders: readonly LeaderUnitCard[],
    resolveCardRef: (card: Card) => ISavedCardRef
): IEngineOnlyFact[] {
    return pilotDeployedLeaders.map((leader) => {
        const host = leader.isAttached() ? (leader.parentCard as unknown as Card) : null;

        return {
            category: 'pilotLeader',
            source: resolveCardRef(leader),
            target: host ? resolveCardRef(host) : null,
            duration: null,
            description: host
                ? `${leader.internalName} is deployed as a pilot attached to ${host.internalName}`
                : `${leader.internalName} is deployed as a pilot but has no attached host`,
        };
    });
}

/**
 * One `watcherEntry` fact per registered state watcher whose entries are non-empty. Watchers reset only at
 * end of phase, so a mid-phase save routinely carries entries; A2 owns the actual entry encoding, so this
 * unit records only that state was dropped, never its content. Must read `entryCount`, never
 * `getCurrentValue()` (see `StateWatcher.entryCount`'s own doc comment for why).
 */
export function buildWatcherEntryFacts(game: Game): IEngineOnlyFact[] {
    return game.stateWatcherRegistrar.registeredWatchers
        .filter((watcher) => watcher.entryCount > 0)
        .map((watcher) => ({
            category: 'watcherEntry' as const,
            source: null,
            target: null,
            duration: null,
            description: `${watcher.name} watcher has ${watcher.entryCount} recorded ${watcher.entryCount === 1 ? 'entry' : 'entries'} not encoded in this format version (see TODO(P2-A2))`,
        }));
}
