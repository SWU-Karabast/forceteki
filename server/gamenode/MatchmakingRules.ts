import type { PreviousMatchEntry, QueuedPlayer } from './QueueHandler';
import type { IScheduler } from '../utils/IScheduler';
import { MatchmakingCompetitivenessPreference, MatchmakingCompetitivenessPreferenceSearchStage } from '../game/core/Constants';
import { Contract } from '../game/core/utils/Contract';
import type { IMatchmakingPreferencePolicy } from './GameNodeConfig';
import { MatchmakingCompetitivenessPreferencePolicyKey } from './GameNodeConfig';

export interface IMatchmakingSearchContext {
    preference: MatchmakingCompetitivenessPreference;
    searchStartedAt: number;
    preferencesPublishedAt?: Partial<Record<MatchmakingCompetitivenessPreference, number>>;
}

export interface IQueueMatchmakingStatus {
    preference: MatchmakingCompetitivenessPreference;
    searchStartedAt: number;
    serverTime: number;
    stage: MatchmakingCompetitivenessPreferenceSearchStage;

    /** Displayed categories; expansions are previewed before they become matchable. */
    allowedOpponentPreferences: MatchmakingCompetitivenessPreference[];

    /** Epoch time of the next preview update, not the actual matching deadline. */
    nextExpansionAt: number | null;
}

export interface IMatchmakingPlayerEntry {
    player: QueuedPlayer;
    previousMatch?: PreviousMatchEntry;
}

export interface IMatchmakingRule {
    canMatch(player1: IMatchmakingPlayerEntry, player2: IMatchmakingPlayerEntry): boolean;

    /** Rules allow matching at now >= this deadline; zero means this rule imposes no delay. */
    getMatchAvailableAt(player1: IMatchmakingPlayerEntry, player2: IMatchmakingPlayerEntry): number;
}

export function getMatchmakingSearchContext(player: QueuedPlayer): IMatchmakingSearchContext {
    Contract.assertNotNullLike(player.searchStartedAt, `Queued player ${player.user.getId()} has not started searching`);
    return {
        preference: player.matchmakingPreference,
        searchStartedAt: player.searchStartedAt,
        preferencesPublishedAt: { ...player.preferencesPublishedAt },
    };
}

function getOpponentPreferenceAvailableAt(
    player: QueuedPlayer,
    opponentPreference: MatchmakingCompetitivenessPreference,
    policy: Readonly<IMatchmakingPreferencePolicy>
): number {
    Contract.assertNotNullLike(player.searchStartedAt, `Queued player ${player.user.getId()} has not started searching`);

    if (player.matchmakingPreference === MatchmakingCompetitivenessPreference.NoPreference || player.matchmakingPreference === opponentPreference) {
        return player.searchStartedAt;
    }

    const noPreferenceAvailableAt = player.searchStartedAt + policy[MatchmakingCompetitivenessPreferencePolicyKey.SamePreferenceOnlyDurationMs];
    return opponentPreference === MatchmakingCompetitivenessPreference.NoPreference
        ? noPreferenceAvailableAt
        : noPreferenceAvailableAt + policy[MatchmakingCompetitivenessPreferencePolicyKey.NoPreferenceDurationMs];
}

function getOpponentMatchAvailableAt(
    player: QueuedPlayer,
    opponentPreference: MatchmakingCompetitivenessPreference,
    policy: Readonly<IMatchmakingPreferencePolicy>,
    serverTime: number,
    expansionDelayMs: number
): number {
    const availableAt = getOpponentPreferenceAvailableAt(player, opponentPreference, policy);
    if (availableAt === player.searchStartedAt) {
        return availableAt;
    }

    // Expanded categories are previewed before eligibility, without extending their matching windows.
    const publishedAt = player.preferencesPublishedAt[opponentPreference];
    return Math.max(availableAt, (publishedAt ?? serverTime) + expansionDelayMs);
}

export function getQueueMatchmakingStatus(
    player: QueuedPlayer,
    policy: Readonly<IMatchmakingPreferencePolicy>,
    serverTime: number,
    expansionDelayMs: number
): IQueueMatchmakingStatus {
    const preferenceAvailability = Object.values(MatchmakingCompetitivenessPreference).map((preference) => ({
        preference,
        availableAt: Math.max(
            player.searchStartedAt,
            getOpponentPreferenceAvailableAt(player, preference, policy) - expansionDelayMs
        ),
    }));
    const allowedOpponentPreferences = preferenceAvailability
        .filter(({ availableAt }) => availableAt <= serverTime)
        .map(({ preference }) => preference);
    const futureExpansionTimes = preferenceAvailability
        .filter(({ availableAt }) => availableAt > serverTime)
        .map(({ availableAt }) => availableAt);

    return {
        preference: player.matchmakingPreference,
        searchStartedAt: player.searchStartedAt,
        serverTime,
        stage: allowedOpponentPreferences.length === 3
            ? MatchmakingCompetitivenessPreferenceSearchStage.AnyPreference
            : allowedOpponentPreferences.length === 2
                ? MatchmakingCompetitivenessPreferenceSearchStage.IncludesNoPreference
                : MatchmakingCompetitivenessPreferenceSearchStage.SamePreferenceOnly,
        allowedOpponentPreferences,
        nextExpansionAt: futureExpansionTimes.length > 0 ? Math.min(...futureExpansionTimes) : null,
    };
}

/**
 * Collection of predefined matchmaking rules & values
 */
export const MatchmakingRule = {
    /**
     * A matchmaking rule that prevents players from rematching
     * within a specified cooldown period.
     *
     * @param cooldownSeconds The cooldown period in seconds
     * @param scheduler Supplies the current time
     * @returns An instance of IMatchmakingRule enforcing the cooldown
     */
    rematchCooldown: (cooldownSeconds: number, scheduler: IScheduler, enforceCooldown: boolean): IMatchmakingRule => {
        return new RematchCooldownRule(cooldownSeconds, scheduler, enforceCooldown);
    },
    preference: (policy: Readonly<IMatchmakingPreferencePolicy>, scheduler: IScheduler, expansionDelayMs: number): IMatchmakingRule => {
        return new PreferenceMatchmakingRule(policy, scheduler, expansionDelayMs);
    },
};

class PreferenceMatchmakingRule implements IMatchmakingRule {
    public constructor(
        private readonly policy: Readonly<IMatchmakingPreferencePolicy>,
        private readonly scheduler: IScheduler,
        private readonly expansionDelayMs: number
    ) {}

    public canMatch(playerEntry1: IMatchmakingPlayerEntry, playerEntry2: IMatchmakingPlayerEntry): boolean {
        return this.scheduler.now() >= this.getMatchAvailableAt(playerEntry1, playerEntry2);
    }

    public getMatchAvailableAt(playerEntry1: IMatchmakingPlayerEntry, playerEntry2: IMatchmakingPlayerEntry): number {
        const serverTime = this.scheduler.now();
        return Math.max(
            getOpponentMatchAvailableAt(playerEntry1.player, playerEntry2.player.matchmakingPreference, this.policy, serverTime, this.expansionDelayMs),
            getOpponentMatchAvailableAt(playerEntry2.player, playerEntry1.player.matchmakingPreference, this.policy, serverTime, this.expansionDelayMs)
        );
    }
}

class RematchCooldownRule implements IMatchmakingRule {
    private cooldownMs: number;
    private readonly scheduler: IScheduler;
    private readonly enforceCooldown: boolean;

    public constructor(cooldownSeconds: number, scheduler: IScheduler, enforceCooldown: boolean) {
        this.cooldownMs = cooldownSeconds * 1000;
        this.scheduler = scheduler;
        this.enforceCooldown = enforceCooldown;
    }

    public canMatch(playerEntry1: IMatchmakingPlayerEntry, playerEntry2: IMatchmakingPlayerEntry): boolean {
        return this.scheduler.now() >= this.getMatchAvailableAt(playerEntry1, playerEntry2);
    }

    public getMatchAvailableAt(playerEntry1: IMatchmakingPlayerEntry, playerEntry2: IMatchmakingPlayerEntry): number {
        // the matching delay is normally disabled in local dev
        if (!this.enforceCooldown) {
            return 0;
        }

        const p1PreviousMatch = playerEntry1.previousMatch;
        const p2PreviousMatch = playerEntry2.previousMatch;
        let availableAt = 0;

        if (p1PreviousMatch && p1PreviousMatch.opponentUserId === playerEntry2.player.user.getId()) {
            availableAt = p1PreviousMatch.endTimestamp + this.cooldownMs;
        }

        if (p2PreviousMatch && p2PreviousMatch.opponentUserId === playerEntry1.player.user.getId()) {
            availableAt = Math.max(availableAt, p2PreviousMatch.endTimestamp + this.cooldownMs);
        }

        return availableAt;
    }
}
