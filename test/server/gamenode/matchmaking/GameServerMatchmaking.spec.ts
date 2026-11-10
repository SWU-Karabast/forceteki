import {
    MatchmakingCompetitivenessPreference,
    MatchmakingCompetitivenessPreferenceSearchStage,
    SwuGameFormat
} from '../../../../server/game/core/Constants';
import { Lobby } from '../../../../server/gamenode/Lobby';
import { MatchmakingCompetitivenessPreferencePolicyKey } from '../../../../server/gamenode/GameNodeConfig';
import { premierBestOfOne } from '../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import { enterQueueAsync, expectMatched, queueClientAsync } from '../../../helpers/server/QueueClients';
import type { TestClient } from '../../../helpers/server/TestClient';

/**
 * Matchmaking policy: which queued players are matched, and when - the preference windows, the retry and announcement
 * timers, the heartbeat status the client shows, and the rematch cooldown. What the queue does as a player's socket comes
 * and goes is in `QueueConnections`, and the quick lobby a match makes in `QuickLobbyCountdown`.
 */
describe('GameServer matchmaking', function () {
    serverIntegration(function (contextRef) {
        describe('queue entry validation', function () {
            it('defaults an omitted preference to unrestricted no preference for older clients', async function () {
                const { harness } = contextRef;
                const legacy = await queueClientAsync(harness);

                expect(legacy.queueMatchmakingStatus).toEqual({
                    searchStartedAt: harness.clock.now(),
                    serverTime: harness.clock.now(),
                    competitiveness: {
                        preference: MatchmakingCompetitivenessPreference.NoPreference,
                        stage: MatchmakingCompetitivenessPreferenceSearchStage.AnyPreference,
                        allowedOpponentPreferences: Object.values(MatchmakingCompetitivenessPreference),
                        nextExpansionAt: null,
                    },
                });
            });

            const invalidPreferences = ['competitive', '', null, 1, [], { preference: 'casualBrewing' }];
            for (const matchmakingPreference of invalidPreferences) {
                it(`rejects the invalid supplied preference ${JSON.stringify(matchmakingPreference)}`, async function () {
                    const { harness } = contextRef;
                    const client = harness.createClient();
                    const response = await harness.api.post('/api/enter-queue').send({
                        ...premierBestOfOne,
                        user: client.userPayload(),
                        deck: harness.decklists.validDecklist(),
                        matchmakingCompetitivenessPreference: matchmakingPreference,
                    });

                    expect(response.status).toBe(400);
                    expect(response.body).toEqual({
                        success: false,
                        message: jasmine.stringMatching('Invalid matchmaking competitiveness preference'),
                    });

                    await client.connectAsync();
                    expect(client.isConnected).toBeFalse();
                    expect(client.connectionErrors).toEqual(['Connection error, please try again']);
                });
            }
        });

        describe('eligibility windows', function () {
            for (const preference of Object.values(MatchmakingCompetitivenessPreference)) {
                it(`matches two ${preference} players immediately`, async function () {
                    const { harness } = contextRef;
                    const player1 = await queueClientAsync(harness, preference);
                    const player2 = await queueClientAsync(harness, preference);

                    expectMatched(player1, player2);
                });
            }

            for (const preference of [MatchmakingCompetitivenessPreference.Competitive, MatchmakingCompetitivenessPreference.Casual]) {
                it(`previews no preference at 13.5 seconds and matches at 15 seconds for ${preference}`, async function () {
                    const { harness } = contextRef;
                    const preferred = await queueClientAsync(harness, preference);
                    const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);

                    await harness.clock.advanceAsync(13_499);
                    expect(preferred.lobbyState).toBeUndefined();
                    expect(noPreference.lobbyState).toBeUndefined();

                    await harness.clock.advanceAsync(1);
                    expect(preferred.queueMatchmakingStatus.competitiveness.allowedOpponentPreferences).toContain(MatchmakingCompetitivenessPreference.NoPreference);
                    expect(preferred.lobbyState).toBeUndefined();
                    expect(noPreference.lobbyState).toBeUndefined();

                    await harness.clock.advanceAsync(1_499);
                    expect(preferred.lobbyState).toBeUndefined();
                    expect(noPreference.lobbyState).toBeUndefined();
                    await harness.clock.advanceAsync(1);
                    expectMatched(preferred, noPreference);
                });
            }

            it('previews opposite preferences at 28.5 seconds and matches at 30 seconds without needing another arrival', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const casual = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual);

                await harness.clock.advanceAsync(15_000);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(13_499);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();

                await harness.clock.advanceAsync(1);
                expect(competitive.queueMatchmakingStatus.competitiveness.allowedOpponentPreferences).toContain(MatchmakingCompetitivenessPreference.Casual);
                expect(casual.queueMatchmakingStatus.competitiveness.allowedOpponentPreferences).toContain(MatchmakingCompetitivenessPreference.Competitive);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1_499);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, casual);
            });

            it('protects a newly arrived opposite-preference player even when the older search is unrestricted', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                await harness.clock.advanceAsync(31_000);
                const casual = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual);

                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(29_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();

                await harness.clock.advanceAsync(1);
                expectMatched(competitive, casual);
            });

            it('does not let a long-waiting no-preference player bypass a new preferred player\'s first window', async function () {
                const { harness } = contextRef;
                const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);
                await harness.clock.advanceAsync(31_000);
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);

                await harness.clock.advanceAsync(14_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(noPreference.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(noPreference, competitive);
            });

            it('lets a new no-preference player match immediately with an already widened preferred search', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                await harness.clock.advanceAsync(15_000);
                const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);

                expectMatched(competitive, noPreference);
            });

            it('schedules the preview exactly 1.5 seconds before eligibility when the search starts between heartbeat ticks', async function () {
                const { harness } = contextRef;
                await harness.clock.advanceAsync(123);
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);
                const searchStartedAt = harness.clock.now();

                await harness.clock.advanceAsync(13_499);
                expect(competitive.queueMatchmakingStatus.competitiveness.stage).toBe(MatchmakingCompetitivenessPreferenceSearchStage.SamePreferenceOnly);
                await harness.clock.advanceAsync(1);
                const firstExpansion = competitive.receivedEvents('queueHeartbeat').find((event) =>
                    event.args[1].competitiveness.allowedOpponentPreferences.includes(MatchmakingCompetitivenessPreference.NoPreference)
                );
                expect(firstExpansion.args[1].serverTime).toBe(searchStartedAt + 13_500);
                expect(competitive.lobbyState).toBeUndefined();
                expect(noPreference.lobbyState).toBeUndefined();

                await harness.clock.advanceAsync(1_499);
                expect(competitive.lobbyState).toBeUndefined();
                expect(noPreference.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expect(harness.clock.now()).toBe(searchStartedAt + 15_000);
                expectMatched(competitive, noPreference);
            });

            it('still matches a same-preference arrival immediately while a new category is in its visibility grace', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);
                await harness.clock.advanceAsync(13_500);

                expect(competitive.queueMatchmakingStatus.competitiveness.allowedOpponentPreferences).toContain(MatchmakingCompetitivenessPreference.NoPreference);
                expect(competitive.lobbyState).toBeUndefined();
                const samePreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);

                expectMatched(competitive, samePreference);
                expect(noPreference.lobbyState).toBeUndefined();
            });

            it('does not restart the grace when an opponent arrives after the new category was published', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                await harness.clock.advanceAsync(14_500);
                const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);

                await harness.clock.advanceAsync(499);
                expect(competitive.lobbyState).toBeUndefined();
                expect(noPreference.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, noPreference);
            });

            it('does not pause a previously admitted category when the opposite preference is newly announced', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                await harness.clock.advanceAsync(28_500);

                expect(competitive.queueMatchmakingStatus.competitiveness.stage).toBe(MatchmakingCompetitivenessPreferenceSearchStage.AnyPreference);
                const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);

                expectMatched(competitive, noPreference);
            });

            it('matches simultaneous arrivals into distinct pairs without duplicating or stranding players', async function () {
                const { harness } = contextRef;
                const players = await Promise.all(Array.from({ length: 4 }, () =>
                    queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive)
                ));
                await harness.clock.settlePendingWorkAsync();

                const lobbyIds = new Set(players.map((player) => player.lobbyState?.id));
                expect(lobbyIds.size).toBe(2);
                expect(lobbyIds.has(undefined)).toBeFalse();
                for (const player of players) {
                    const opponent = players.find((candidate) => candidate.id !== player.id && candidate.lobbyState?.id === player.lobbyState?.id);
                    expect(opponent).toBeDefined();
                    expectMatched(player, opponent);
                }
            });

            it('keeps rematch cooldown binding even when preference eligibility allows the pair', async function () {
                const { harness } = contextRef;
                const player1 = harness.createClient();
                const player2 = harness.createClient();
                harness.server.recordExpiringMatchmakingEntry(player1.id, player2.id, harness.clock.now());
                for (const player of [player1, player2]) {
                    await enterQueueAsync(harness, player, MatchmakingCompetitivenessPreference.Competitive);
                    await player.connectAsync();
                }

                await harness.clock.advanceAsync(14_999);
                expect(player1.lobbyState).toBeUndefined();
                expect(player2.lobbyState).toBeUndefined();

                await harness.clock.advanceAsync(1);
                expectMatched(player1, player2);
            });
        });

        describe('absolute retry scheduling', function () {
            it('runs another pass when a new format becomes ready during awaited lobby setup', async function () {
                const { harness } = contextRef;
                const player1 = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const addLobbyUserAsync = Lobby.prototype.addLobbyUserAsync;
                let notifySetupStarted: () => void;
                let resumeSetup: () => void;
                const setupStarted = new Promise<void>((resolve) => notifySetupStarted = resolve);
                const setupPaused = new Promise<void>((resolve) => resumeSetup = resolve);
                let paused = false;
                const addLobbyUserSpy = spyOn(Lobby.prototype, 'addLobbyUserAsync');
                addLobbyUserSpy.and.callFake(async (user, socket) => {
                    const lobby = addLobbyUserSpy.calls.mostRecent().object;
                    if (!(lobby instanceof Lobby)) {
                        throw new Error('Expected lobby setup to be called on a Lobby');
                    }
                    if (!paused) {
                        paused = true;
                        notifySetupStarted();
                        await setupPaused;
                    }
                    await addLobbyUserAsync.call(lobby, user, socket);
                });

                const player2Connecting = queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                let eternalPlayer1: TestClient;
                let eternalPlayer2: TestClient;
                try {
                    await setupStarted;
                    const eternalConfig = { ...premierBestOfOne, format: SwuGameFormat.Eternal };
                    eternalPlayer1 = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual, {}, eternalConfig);
                    eternalPlayer2 = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual, {}, eternalConfig);
                    expect(eternalPlayer1.lobbyState).toBeUndefined();
                    expect(eternalPlayer2.lobbyState).toBeUndefined();
                } finally {
                    resumeSetup();
                }

                const player2 = await player2Connecting;
                await harness.clock.settlePendingWorkAsync();
                expectMatched(player1, player2);
                expectMatched(eternalPlayer1, eternalPlayer2);
                expect(eternalPlayer1.lobbyState.id).not.toBe(player1.lobbyState.id);
            });

            it('does not postpone an existing deadline when another player arrives', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);
                await harness.clock.advanceAsync(10_000);
                const newcomer = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual);

                await harness.clock.advanceAsync(4_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(noPreference.lobbyState).toBeUndefined();
                expect(newcomer.lobbyState).toBeUndefined();

                await harness.clock.advanceAsync(1);
                expectMatched(competitive, noPreference);
                expect(newcomer.lobbyState).toBeUndefined();
            });

            it('uses only an announcement timer for a lone preferred player', async function () {
                const { harness } = contextRef;
                const backgroundTaskCount = harness.clock.pendingTaskCount;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);

                expect(harness.clock.pendingTaskCount).toBe(backgroundTaskCount + 1);
                await harness.clock.advanceAsync(30_000);
                expect(harness.clock.pendingTaskCount).toBe(backgroundTaskCount);
                expect(competitive.lobbyState).toBeUndefined();
                expect(competitive.queueMatchmakingStatus.competitiveness.stage).toBe(MatchmakingCompetitivenessPreferenceSearchStage.AnyPreference);
            });

            it('shares one announcement timer across formats without postponing the oldest preview', async function () {
                const { harness } = contextRef;
                const backgroundTaskCount = harness.clock.pendingTaskCount;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const searchStartedAt = harness.clock.now();
                await harness.clock.advanceAsync(10_000);
                const eternalConfig = { ...premierBestOfOne, format: SwuGameFormat.Eternal };
                const casual = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual, {}, eternalConfig);

                expect(harness.clock.pendingTaskCount).toBe(backgroundTaskCount + 1);
                await harness.clock.advanceAsync(3_499);
                expect(competitive.queueMatchmakingStatus.competitiveness.stage).toBe(MatchmakingCompetitivenessPreferenceSearchStage.SamePreferenceOnly);
                await harness.clock.advanceAsync(1);
                expect(competitive.queueMatchmakingStatus.serverTime).toBe(searchStartedAt + 13_500);
                expect(competitive.queueMatchmakingStatus.competitiveness.stage).toBe(MatchmakingCompetitivenessPreferenceSearchStage.IncludesNoPreference);
                expect(casual.queueMatchmakingStatus.competitiveness.stage).toBe(MatchmakingCompetitivenessPreferenceSearchStage.SamePreferenceOnly);
                expect(harness.clock.pendingTaskCount).toBe(backgroundTaskCount + 1);
            });

            it('matches separate formats at their own deadlines without losing the later retry', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const casual = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual);
                await harness.clock.advanceAsync(10_000);
                const eternalConfig = { ...premierBestOfOne, format: SwuGameFormat.Eternal };
                const eternalCompetitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive, {}, eternalConfig);
                const eternalCasual = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual, {}, eternalConfig);

                await harness.clock.advanceAsync(19_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(eternalCompetitive.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, casual);
                expect(eternalCompetitive.lobbyState).toBeUndefined();
                expect(eternalCasual.lobbyState).toBeUndefined();

                await harness.clock.advanceAsync(9_999);
                expect(eternalCompetitive.lobbyState).toBeUndefined();
                expect(eternalCasual.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(eternalCompetitive, eternalCasual);
                expect(eternalCompetitive.lobbyState.id).not.toBe(competitive.lobbyState.id);
            });

            it('keeps only one retry task for an unmatched pair and cancels it on shutdown', async function () {
                const { harness } = contextRef;
                const backgroundTaskCount = harness.clock.pendingTaskCount;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const casual = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual);

                expect(harness.clock.pendingTaskCount).toBe(backgroundTaskCount + 2);
                await harness.shutdownAsync();
                expect(harness.clock.pendingTaskCount).toBe(0);

                await harness.clock.advanceAsync(30_000);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();
            });

            it('waits for active matchmaking before cleanup and prevents timers from surviving shutdown', async function () {
                const { harness } = contextRef;
                const player1 = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const addLobbyUserAsync = Lobby.prototype.addLobbyUserAsync;
                let notifySetupStarted: () => void;
                let resumeSetup: () => void;
                const setupStarted = new Promise<void>((resolve) => notifySetupStarted = resolve);
                const setupPaused = new Promise<void>((resolve) => resumeSetup = resolve);
                let paused = false;
                const addLobbyUserSpy = spyOn(Lobby.prototype, 'addLobbyUserAsync');
                addLobbyUserSpy.and.callFake(async (user, socket) => {
                    const lobby = addLobbyUserSpy.calls.mostRecent().object;
                    if (!(lobby instanceof Lobby)) {
                        throw new Error('Expected lobby setup to be called on a Lobby');
                    }
                    if (!paused) {
                        paused = true;
                        notifySetupStarted();
                        await setupPaused;
                    }
                    await addLobbyUserAsync.call(lobby, user, socket);
                });

                const player2Connecting = queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                await setupStarted;
                let shutdownFinished = false;
                const shutdown = harness.shutdownAsync().then(() => shutdownFinished = true);
                try {
                    await harness.clock.settlePendingWorkAsync();
                    expect(shutdownFinished).toBeFalse();
                    // the server has cancelled its own timers; only the database services' remain until shutdown ends
                    expect(harness.clock.pendingTaskCount).toBe(harness.databaseTaskCount);
                } finally {
                    resumeSetup();
                }

                const player2 = await player2Connecting;
                await shutdown;
                expect(shutdownFinished).toBeTrue();
                expectMatched(player1, player2);
                expect(harness.server.getUserLobbyId(player1.id)).toBeUndefined();
                expect(harness.server.getUserLobbyId(player2.id)).toBeUndefined();

                await player1.disconnectTransportAsync();
                await player2.disconnectTransportAsync();
                await harness.clock.advanceAsync(30_000);
                expect(harness.clock.pendingTaskCount).toBe(0);
            });
        });

        describe('heartbeat status', function () {
            for (const preference of [MatchmakingCompetitivenessPreference.Competitive, MatchmakingCompetitivenessPreference.Casual]) {
                it(`reports exact stage transitions and original search time for a lone ${preference} search`, async function () {
                    const { harness } = contextRef;
                    const client = await queueClientAsync(harness, preference);
                    const searchStartedAt = harness.clock.now();
                    expect(client.receivedEvents('queueHeartbeat')[0].args).toEqual([
                        searchStartedAt,
                        {
                            searchStartedAt,
                            serverTime: searchStartedAt,
                            competitiveness: {
                                preference,
                                stage: MatchmakingCompetitivenessPreferenceSearchStage.SamePreferenceOnly,
                                allowedOpponentPreferences: [preference],
                                nextExpansionAt: searchStartedAt + 13_500,
                            },
                        },
                    ]);

                    await harness.clock.advanceAsync(13_499);
                    expect(client.queueMatchmakingStatus.competitiveness.stage).toBe(MatchmakingCompetitivenessPreferenceSearchStage.SamePreferenceOnly);
                    await harness.clock.advanceAsync(1);
                    expect(client.queueMatchmakingStatus).toEqual({
                        searchStartedAt,
                        serverTime: searchStartedAt + 13_500,
                        competitiveness: {
                            preference,
                            stage: MatchmakingCompetitivenessPreferenceSearchStage.IncludesNoPreference,
                            allowedOpponentPreferences: [preference, MatchmakingCompetitivenessPreference.NoPreference],
                            nextExpansionAt: searchStartedAt + 28_500,
                        },
                    });

                    await harness.clock.advanceAsync(14_999);
                    expect(client.queueMatchmakingStatus.competitiveness.stage).toBe(MatchmakingCompetitivenessPreferenceSearchStage.IncludesNoPreference);
                    await harness.clock.advanceAsync(1);
                    expect(client.queueMatchmakingStatus).toEqual({
                        searchStartedAt,
                        serverTime: searchStartedAt + 28_500,
                        competitiveness: {
                            preference,
                            stage: MatchmakingCompetitivenessPreferenceSearchStage.AnyPreference,
                            allowedOpponentPreferences: Object.values(MatchmakingCompetitivenessPreference),
                            nextExpansionAt: null,
                        },
                    });
                });
            }

            it('does not send further queue heartbeats once the players have matched', async function () {
                const { harness } = contextRef;
                const player1 = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const player2 = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                expectMatched(player1, player2);
                const heartbeatCounts = [player1, player2].map((player) => player.receivedEvents('queueHeartbeat').length);

                await harness.clock.advanceAsync(1_000);

                expect([player1, player2].map((player) => player.receivedEvents('queueHeartbeat').length)).toEqual(heartbeatCounts);
            });
        });
    });

    describe('with logged-in users', function () {
        serverIntegration(function (contextRef) {
            it('applies the same preference policy to anonymous and authenticated users', async function () {
                const { harness } = contextRef;
                const anonymous = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual);
                const authenticated = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual, { authenticated: true });

                expectMatched(anonymous, authenticated);
            });
        });
    });

    describe('a custom timing policy', function () {
        serverIntegration(function (contextRef) {
            it('uses backend-configured deadlines for both matching and heartbeat status', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const casual = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual);
                const searchStartedAt = harness.clock.now();
                expect(competitive.queueMatchmakingStatus.competitiveness.nextExpansionAt).toBe(searchStartedAt + 500);

                await harness.clock.advanceAsync(2_000);
                expect(competitive.lobbyState).toBeUndefined();
                expect(competitive.queueMatchmakingStatus.competitiveness).toEqual(jasmine.objectContaining({
                    stage: MatchmakingCompetitivenessPreferenceSearchStage.IncludesNoPreference,
                    allowedOpponentPreferences: [MatchmakingCompetitivenessPreference.Competitive, MatchmakingCompetitivenessPreference.NoPreference],
                    nextExpansionAt: searchStartedAt + 3_500,
                }));
                await harness.clock.advanceAsync(2_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, casual);
            });
        }, {
            config: {
                matchmakingPreferencePolicy: {
                    [MatchmakingCompetitivenessPreferencePolicyKey.SamePreferenceOnlyDurationMs]: 2_000,
                    [MatchmakingCompetitivenessPreferencePolicyKey.NoPreferenceDurationMs]: 3_000,
                },
            },
        });
    });

    describe('when rematch cooldown is disabled', function () {
        serverIntegration(function (contextRef) {
            it('still enforces the preference windows', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const casual = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual);
                harness.server.recordExpiringMatchmakingEntry(competitive.id, casual.id, harness.clock.now());

                await harness.clock.advanceAsync(29_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, casual);
            });
        }, { config: { enforceRematchCooldown: false } });
    });
});
