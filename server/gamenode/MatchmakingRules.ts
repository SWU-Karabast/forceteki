import type { PreviousMatchEntry, QueuedPlayer } from './QueueHandler';
import type { IScheduler } from '../utils/IScheduler';
import { MatchmakingPreference, MatchmakingSearchStage } from '../game/core/Constants';
import { Contract } from '../game/core/utils/Contract';
import type { IMatchmakingPreferencePolicy } from './GameNodeConfig';
import { MatchmakingPreferencePolicyKey } from './GameNodeConfig';

export interface IMatchmakingSearchContext {
    preference: MatchmakingPreference;
    searchStartedAt: number;
}

export interface IQueueMatchmakingStatus extends IMatchmakingSearchContext {
    serverTime: number;
    stage: MatchmakingSearchStage;
    allowedOpponentPreferences: MatchmakingPreference[];
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
    return { preference: player.matchmakingPreference, searchStartedAt: player.searchStartedAt };
}

function getOpponentPreferenceAvailableAt(
    player: QueuedPlayer,
    opponentPreference: MatchmakingPreference,
    policy: Readonly<IMatchmakingPreferencePolicy>
): number {
    Contract.assertNotNullLike(player.searchStartedAt, `Queued player ${player.user.getId()} has not started searching`);

    if (player.matchmakingPreference === MatchmakingPreference.NoPreference || player.matchmakingPreference === opponentPreference) {
        return player.searchStartedAt;
    }

    const noPreferenceAvailableAt = player.searchStartedAt + policy[MatchmakingPreferencePolicyKey.SamePreferenceOnlyDurationMs];
    return opponentPreference === MatchmakingPreference.NoPreference
        ? noPreferenceAvailableAt
        : noPreferenceAvailableAt + policy[MatchmakingPreferencePolicyKey.NoPreferenceDurationMs];
}

export function getQueueMatchmakingStatus(
    player: QueuedPlayer,
    policy: Readonly<IMatchmakingPreferencePolicy>,
    serverTime: number
): IQueueMatchmakingStatus {
    const preferenceAvailability = Object.values(MatchmakingPreference).map((preference) => ({
        preference,
        availableAt: getOpponentPreferenceAvailableAt(player, preference, policy),
    }));
    const allowedOpponentPreferences = preferenceAvailability
        .filter(({ availableAt }) => availableAt <= serverTime)
        .map(({ preference }) => preference);
    const futureExpansionTimes = preferenceAvailability
        .filter(({ availableAt }) => availableAt > serverTime)
        .map(({ availableAt }) => availableAt);

    return {
        ...getMatchmakingSearchContext(player),
        serverTime,
        stage: allowedOpponentPreferences.length === 3
            ? MatchmakingSearchStage.AnyPreference
            : allowedOpponentPreferences.length === 2
                ? MatchmakingSearchStage.IncludesNoPreference
                : MatchmakingSearchStage.SamePreferenceOnly,
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
    preference: (policy: Readonly<IMatchmakingPreferencePolicy>, scheduler: IScheduler): IMatchmakingRule => {
        return new PreferenceMatchmakingRule(policy, scheduler);
    },
};

class PreferenceMatchmakingRule implements IMatchmakingRule {
    public constructor(
        private readonly policy: Readonly<IMatchmakingPreferencePolicy>,
        private readonly scheduler: IScheduler
    ) {}

    public canMatch(playerEntry1: IMatchmakingPlayerEntry, playerEntry2: IMatchmakingPlayerEntry): boolean {
        return this.scheduler.now() >= this.getMatchAvailableAt(playerEntry1, playerEntry2);
    }

    public getMatchAvailableAt(playerEntry1: IMatchmakingPlayerEntry, playerEntry2: IMatchmakingPlayerEntry): number {
        return Math.max(
            getOpponentPreferenceAvailableAt(playerEntry1.player, playerEntry2.player.matchmakingPreference, this.policy),
            getOpponentPreferenceAvailableAt(playerEntry2.player, playerEntry1.player.matchmakingPreference, this.policy)
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
