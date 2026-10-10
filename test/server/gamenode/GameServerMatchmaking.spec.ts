import {
    CardPool,
    GamesToWinMode,
    MatchmakingPreference,
    MatchmakingSearchStage,
    SwuGameFormat
} from '../../../server/game/core/Constants';
import { Lobby, MatchmakingType } from '../../../server/gamenode/Lobby';
import { MatchmakingPreferencePolicyKey } from '../../../server/gamenode/GameNodeConfig';
import { serverIntegration } from '../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../helpers/server/ServerTestHarness';
import type { IMatchConfiguration, ITestClientOptions, TestClient } from '../../helpers/server/TestClient';

const matchConfig = {
    format: SwuGameFormat.Premier,
    cardPool: CardPool.Current,
    gamesToWinMode: GamesToWinMode.BestOfOne,
};

async function enterQueueAsync(
    harness: ServerTestHarness,
    client: TestClient,
    matchmakingPreference?: MatchmakingPreference,
    configuration: IMatchConfiguration = matchConfig
): Promise<void> {
    const response = await client.enterQueueAsync({
        ...configuration,
        deck: harness.decklists.validDecklist(configuration),
        matchmakingPreference,
    });
    expect(response.status).withContext(JSON.stringify(response.body))
        .toBe(200);
    expect(response.body.success).toBeTrue();
}

async function queueClientAsync(
    harness: ServerTestHarness,
    matchmakingPreference?: MatchmakingPreference,
    options: ITestClientOptions = {},
    configuration: IMatchConfiguration = matchConfig
): Promise<TestClient> {
    const client = harness.createClient(options);
    await enterQueueAsync(harness, client, matchmakingPreference, configuration);
    await client.connectAsync();
    return client;
}

function expectMatched(player1: TestClient, player2: TestClient): void {
    const expectedIds = [player1.id, player2.id].sort();
    for (const player of [player1, player2]) {
        expect(player.lobbyState?.gameType).toBe(MatchmakingType.Quick);
        expect(player.lobbyState?.users.map((user: { id: string }) => user.id).sort()).toEqual(expectedIds);
    }
    expect(player1.lobbyState?.id).toBeDefined();
    expect(player2.lobbyState?.id).toBe(player1.lobbyState?.id);
}

describe('GameServer matchmaking preferences', function () {
    serverIntegration(function (contextRef) {
        describe('queue entry validation', function () {
            it('defaults an omitted preference to unrestricted no preference for older clients', async function () {
                const { harness } = contextRef;
                const legacy = await queueClientAsync(harness);

                expect(legacy.queueMatchmakingStatus).toEqual({
                    preference: MatchmakingPreference.NoPreference,
                    searchStartedAt: harness.clock.now(),
                    serverTime: harness.clock.now(),
                    stage: MatchmakingSearchStage.AnyPreference,
                    allowedOpponentPreferences: Object.values(MatchmakingPreference),
                    nextExpansionAt: null,
                });
            });

            const invalidPreferences = ['competitive', '', null, 1, [], { preference: 'casualBrewing' }];
            for (const matchmakingPreference of invalidPreferences) {
                it(`rejects the invalid supplied preference ${JSON.stringify(matchmakingPreference)}`, async function () {
                    const { harness } = contextRef;
                    const client = harness.createClient();
                    const response = await harness.api.post('/api/enter-queue').send({
                        ...matchConfig,
                        user: client.userPayload(),
                        deck: harness.decklists.validDecklist(),
                        matchmakingPreference,
                    });

                    expect(response.status).toBe(400);
                    expect(response.body).toEqual({
                        success: false,
                        message: jasmine.stringMatching('Invalid matchmaking preference'),
                    });

                    await client.connectAsync();
                    expect(client.isConnected).toBeFalse();
                    expect(client.connectionErrors).toEqual(['Connection error, please try again']);
                });
            }
        });

        describe('eligibility windows', function () {
            for (const preference of Object.values(MatchmakingPreference)) {
                it(`matches two ${preference} players immediately`, async function () {
                    const { harness } = contextRef;
                    const player1 = await queueClientAsync(harness, preference);
                    const player2 = await queueClientAsync(harness, preference);

                    expectMatched(player1, player2);
                });
            }

            for (const preference of [MatchmakingPreference.CompetitiveTesting, MatchmakingPreference.CasualBrewing]) {
                it(`admits no preference at exactly 15 seconds for ${preference}`, async function () {
                    const { harness } = contextRef;
                    const preferred = await queueClientAsync(harness, preference);
                    const noPreference = await queueClientAsync(harness, MatchmakingPreference.NoPreference);

                    await harness.clock.advanceAsync(14_999);
                    expect(preferred.lobbyState).toBeUndefined();
                    expect(noPreference.lobbyState).toBeUndefined();

                    await harness.clock.advanceAsync(1);
                    expectMatched(preferred, noPreference);
                });
            }

            it('admits opposite preferences at exactly 30 seconds without waiting for another arrival', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                const casual = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing);

                await harness.clock.advanceAsync(15_000);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(14_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();

                await harness.clock.advanceAsync(1);
                expectMatched(competitive, casual);
            });

            it('protects a newly arrived opposite-preference player even when the older search is unrestricted', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                await harness.clock.advanceAsync(31_000);
                const casual = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing);

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
                const noPreference = await queueClientAsync(harness, MatchmakingPreference.NoPreference);
                await harness.clock.advanceAsync(31_000);
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);

                await harness.clock.advanceAsync(14_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(noPreference.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(noPreference, competitive);
            });

            it('lets a new no-preference player match immediately with an already widened preferred search', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                await harness.clock.advanceAsync(15_000);
                const noPreference = await queueClientAsync(harness, MatchmakingPreference.NoPreference);

                expectMatched(competitive, noPreference);
            });

            it('applies the same preference policy to anonymous and authenticated users', async function () {
                const { harness } = contextRef;
                const anonymous = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing);
                const authenticated = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing, { authenticated: true });

                expectMatched(anonymous, authenticated);
            });

            it('matches simultaneous arrivals into distinct pairs without duplicating or stranding players', async function () {
                const { harness } = contextRef;
                const players = await Promise.all(Array.from({ length: 4 }, () =>
                    queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting)
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
                    await enterQueueAsync(harness, player, MatchmakingPreference.CompetitiveTesting);
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
                const player1 = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
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

                const player2Connecting = queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                let eternalPlayer1: TestClient;
                let eternalPlayer2: TestClient;
                try {
                    await setupStarted;
                    const eternalConfig = { ...matchConfig, format: SwuGameFormat.Eternal };
                    eternalPlayer1 = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing, {}, eternalConfig);
                    eternalPlayer2 = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing, {}, eternalConfig);
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
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                const noPreference = await queueClientAsync(harness, MatchmakingPreference.NoPreference);
                await harness.clock.advanceAsync(10_000);
                const newcomer = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing);

                await harness.clock.advanceAsync(4_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(noPreference.lobbyState).toBeUndefined();
                expect(newcomer.lobbyState).toBeUndefined();

                await harness.clock.advanceAsync(1);
                expectMatched(competitive, noPreference);
                expect(newcomer.lobbyState).toBeUndefined();
            });

            it('does not start a retry timer for a lone player', async function () {
                const { harness } = contextRef;
                const backgroundTaskCount = harness.clock.pendingTaskCount;
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);

                expect(harness.clock.pendingTaskCount).toBe(backgroundTaskCount);
                await harness.clock.advanceAsync(30_000);
                expect(harness.clock.pendingTaskCount).toBe(backgroundTaskCount);
                expect(competitive.lobbyState).toBeUndefined();
                expect(competitive.queueMatchmakingStatus.stage).toBe(MatchmakingSearchStage.AnyPreference);
            });

            it('matches separate formats at their own deadlines without losing the later retry', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                const casual = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing);
                await harness.clock.advanceAsync(10_000);
                const eternalConfig = { ...matchConfig, format: SwuGameFormat.Eternal };
                const eternalCompetitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting, {}, eternalConfig);
                const eternalCasual = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing, {}, eternalConfig);

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
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                const casual = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing);

                expect(harness.clock.pendingTaskCount).toBe(backgroundTaskCount + 1);
                await harness.shutdownAsync();
                expect(harness.clock.pendingTaskCount).toBe(0);

                await harness.clock.advanceAsync(30_000);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();
            });

            it('waits for active matchmaking before cleanup and prevents timers from surviving shutdown', async function () {
                const { harness } = contextRef;
                const player1 = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
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

                const player2Connecting = queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                await setupStarted;
                let shutdownFinished = false;
                const shutdown = harness.shutdownAsync().then(() => shutdownFinished = true);
                try {
                    await harness.clock.settlePendingWorkAsync();
                    expect(shutdownFinished).toBeFalse();
                    expect(harness.clock.pendingTaskCount).toBe(0);
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
            for (const preference of [MatchmakingPreference.CompetitiveTesting, MatchmakingPreference.CasualBrewing]) {
                it(`reports exact stage transitions and original search time for a lone ${preference} search`, async function () {
                    const { harness } = contextRef;
                    const client = await queueClientAsync(harness, preference);
                    const searchStartedAt = harness.clock.now();
                    expect(client.receivedEvents('queueHeartbeat')[0].args).toEqual([
                        searchStartedAt,
                        {
                            preference,
                            searchStartedAt,
                            serverTime: searchStartedAt,
                            stage: MatchmakingSearchStage.SamePreferenceOnly,
                            allowedOpponentPreferences: [preference],
                            nextExpansionAt: searchStartedAt + 15_000,
                        },
                    ]);

                    await harness.clock.advanceAsync(14_999);
                    expect(client.queueMatchmakingStatus.stage).toBe(MatchmakingSearchStage.SamePreferenceOnly);
                    await harness.clock.advanceAsync(1);
                    expect(client.queueMatchmakingStatus).toEqual({
                        preference,
                        searchStartedAt,
                        serverTime: searchStartedAt + 15_000,
                        stage: MatchmakingSearchStage.IncludesNoPreference,
                        allowedOpponentPreferences: [preference, MatchmakingPreference.NoPreference],
                        nextExpansionAt: searchStartedAt + 30_000,
                    });

                    await harness.clock.advanceAsync(14_999);
                    expect(client.queueMatchmakingStatus.stage).toBe(MatchmakingSearchStage.IncludesNoPreference);
                    await harness.clock.advanceAsync(1);
                    expect(client.queueMatchmakingStatus).toEqual({
                        preference,
                        searchStartedAt,
                        serverTime: searchStartedAt + 30_000,
                        stage: MatchmakingSearchStage.AnyPreference,
                        allowedOpponentPreferences: Object.values(MatchmakingPreference),
                        nextExpansionAt: null,
                    });
                });
            }

            it('does not send further queue heartbeats once the players have matched', async function () {
                const { harness } = contextRef;
                const player1 = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                const player2 = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                expectMatched(player1, player2);
                const heartbeatCounts = [player1, player2].map((player) => player.receivedEvents('queueHeartbeat').length);

                await harness.clock.advanceAsync(1_000);

                expect([player1, player2].map((player) => player.receivedEvents('queueHeartbeat').length)).toEqual(heartbeatCounts);
            });
        });

        describe('search lifecycle', function () {
            it('starts waiting time on the first socket connection rather than the HTTP request', async function () {
                const { harness } = contextRef;
                const competitive = harness.createClient();
                await enterQueueAsync(harness, competitive, MatchmakingPreference.CompetitiveTesting);
                await harness.clock.advanceAsync(30_000);
                await competitive.connectAsync();
                const noPreference = await queueClientAsync(harness, MatchmakingPreference.NoPreference);

                expect(competitive.queueMatchmakingStatus.searchStartedAt).toBe(harness.clock.now());
                expect(competitive.queueMatchmakingStatus.stage).toBe(MatchmakingSearchStage.SamePreferenceOnly);
                expect(competitive.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(14_999);
                expect(competitive.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, noPreference);
            });

            it('preserves search age through reconnects and survives the old socket\'s disconnect timeout', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                const noPreference = await queueClientAsync(harness, MatchmakingPreference.NoPreference);
                const searchStartedAt = harness.clock.now();
                await harness.clock.advanceAsync(10_000);
                await competitive.disconnectTransportAsync();
                await harness.clock.advanceAsync(1_000);
                await competitive.connectAsync();

                expect(competitive.previousSocket.connected).toBeFalse();
                expect(competitive.queueMatchmakingStatus).toEqual(jasmine.objectContaining({
                    preference: MatchmakingPreference.CompetitiveTesting,
                    searchStartedAt,
                    stage: MatchmakingSearchStage.SamePreferenceOnly,
                    nextExpansionAt: searchStartedAt + 15_000,
                }));

                await harness.clock.advanceAsync(3_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(competitive.isConnected).toBeTrue();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, noPreference);
            });

            it('preserves search context when a refresh replaces an otherwise connected socket', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                const searchStartedAt = harness.clock.now();
                await harness.clock.advanceAsync(5_000);
                await competitive.connectAsync();

                expect(competitive.previousSocket.connected).toBeFalse();
                expect(competitive.isConnected).toBeTrue();
                expect(competitive.queueMatchmakingStatus).toEqual(jasmine.objectContaining({
                    preference: MatchmakingPreference.CompetitiveTesting,
                    searchStartedAt,
                    nextExpansionAt: searchStartedAt + 15_000,
                }));
            });

            it('does not match a disconnected player at the preference deadline, but resumes immediately on reconnection', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                const noPreference = await queueClientAsync(harness, MatchmakingPreference.NoPreference);
                const searchStartedAt = harness.clock.now();
                await harness.clock.advanceAsync(14_000);
                await competitive.disconnectTransportAsync();
                await harness.clock.advanceAsync(1_000);

                expect(noPreference.lobbyState).toBeUndefined();
                await competitive.connectAsync();
                expect(competitive.queueMatchmakingStatus.searchStartedAt).toBe(searchStartedAt);
                expectMatched(competitive, noPreference);
            });

            it('removes an unreconnected queue entry at the end of the three-second grace window', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                await competitive.disconnectTransportAsync();
                await harness.clock.advanceAsync(3_000);
                await competitive.connectAsync();

                expect(competitive.isConnected).toBeFalse();
                expect(competitive.connectionErrors).toEqual(['Connection error, please try again']);
            });

            it('starts a new clock and accepts a new preference on a fresh form submission', async function () {
                const { harness } = contextRef;
                const client = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                await harness.clock.advanceAsync(20_000);
                await enterQueueAsync(harness, client, MatchmakingPreference.CasualBrewing);
                await client.connectAsync();

                expect(client.queueMatchmakingStatus).toEqual(jasmine.objectContaining({
                    preference: MatchmakingPreference.CasualBrewing,
                    searchStartedAt: harness.clock.now(),
                    stage: MatchmakingSearchStage.SamePreferenceOnly,
                    nextExpansionAt: harness.clock.now() + 15_000,
                }));
            });

            it('removes an explicitly cancelled search and protects a fresh search from its old deadline', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                const noPreference = await queueClientAsync(harness, MatchmakingPreference.NoPreference);
                await harness.clock.advanceAsync(14_000);
                await competitive.manualDisconnectAsync();
                await enterQueueAsync(harness, competitive, MatchmakingPreference.CompetitiveTesting);
                await competitive.connectAsync();
                const searchStartedAt = harness.clock.now();

                expect(competitive.queueMatchmakingStatus.searchStartedAt).toBe(searchStartedAt);
                await harness.clock.advanceAsync(14_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(noPreference.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, noPreference);
            });

            for (const reconnectBeforeRequeue of [false, true]) {
                it(`resets explicit post-game requeue time while retaining preference${reconnectBeforeRequeue ? ' after an in-game refresh' : ''}`, async function () {
                    const { harness } = contextRef;
                    const player = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing);
                    await harness.clock.advanceAsync(20_000);
                    const opponent = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing);
                    expectMatched(player, opponent);
                    await harness.clock.advanceAsync(6_000);
                    expect(player.gameState).toBeDefined();
                    if (reconnectBeforeRequeue) {
                        await player.connectAsync();
                    }
                    await player.sendGameMessageAsync('concede');
                    expect(player.gameState.winners).toHaveSize(1);
                    await harness.clock.advanceAsync(1_000);
                    await player.requeueAsync();
                    await harness.clock.settlePendingWorkAsync();
                    const searchStartedAt = harness.clock.now();

                    expect(player.queueMatchmakingStatus).toEqual(jasmine.objectContaining({
                        preference: MatchmakingPreference.CasualBrewing,
                        searchStartedAt,
                        stage: MatchmakingSearchStage.SamePreferenceOnly,
                        nextExpansionAt: searchStartedAt + 15_000,
                    }));
                    const noPreference = await queueClientAsync(harness, MatchmakingPreference.NoPreference);
                    expect(noPreference.lobbyState).toBeUndefined();
                    await harness.clock.advanceAsync(14_999);
                    expect(noPreference.lobbyState).toBeUndefined();
                    await harness.clock.advanceAsync(1);
                    expectMatched(player, noPreference);
                });
            }

            for (const reconnectBeforeFailure of [false, true]) {
                it(`preserves preference and wait age when the opponent disconnects during countdown${reconnectBeforeFailure ? ' after a matched-lobby refresh' : ''}`, async function () {
                    const { harness } = contextRef;
                    const player = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                    const searchStartedAt = harness.clock.now();
                    await harness.clock.advanceAsync(15_000);
                    const opponent = await queueClientAsync(harness, MatchmakingPreference.NoPreference);
                    expectMatched(player, opponent);
                    if (reconnectBeforeFailure) {
                        await player.connectAsync();
                    }
                    await harness.clock.advanceAsync(1_000);
                    await opponent.disconnectTransportAsync();
                    await harness.clock.advanceAsync(4_999);
                    expect(player.receivedEvents('matchmakingFailed')).toEqual([]);

                    await harness.clock.advanceAsync(1);
                    expect(player.receivedEvents('matchmakingFailed').map((event) => event.args)).toEqual([['Player disconnected']]);
                    expect(player.queueMatchmakingStatus).toEqual(jasmine.objectContaining({
                        preference: MatchmakingPreference.CompetitiveTesting,
                        searchStartedAt,
                        stage: MatchmakingSearchStage.IncludesNoPreference,
                        nextExpansionAt: searchStartedAt + 30_000,
                    }));

                    const replacement = await queueClientAsync(harness, MatchmakingPreference.NoPreference);
                    expectMatched(player, replacement);
                });
            }
        });
    });

    describe('a custom timing policy', function () {
        serverIntegration(function (contextRef) {
            it('uses backend-configured deadlines for both matching and heartbeat status', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                const casual = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing);
                const searchStartedAt = harness.clock.now();
                expect(competitive.queueMatchmakingStatus.nextExpansionAt).toBe(searchStartedAt + 2_000);

                await harness.clock.advanceAsync(2_000);
                expect(competitive.lobbyState).toBeUndefined();
                expect(competitive.queueMatchmakingStatus).toEqual(jasmine.objectContaining({
                    stage: MatchmakingSearchStage.IncludesNoPreference,
                    allowedOpponentPreferences: [MatchmakingPreference.CompetitiveTesting, MatchmakingPreference.NoPreference],
                    nextExpansionAt: searchStartedAt + 5_000,
                }));
                await harness.clock.advanceAsync(2_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, casual);
            });
        }, {
            matchmakingPreferencePolicy: {
                [MatchmakingPreferencePolicyKey.SamePreferenceOnlyDurationMs]: 2_000,
                [MatchmakingPreferencePolicyKey.NoPreferenceDurationMs]: 3_000,
            },
        });
    });

    describe('when rematch cooldown is disabled', function () {
        serverIntegration(function (contextRef) {
            it('still enforces the preference windows', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingPreference.CompetitiveTesting);
                const casual = await queueClientAsync(harness, MatchmakingPreference.CasualBrewing);
                harness.server.recordExpiringMatchmakingEntry(competitive.id, casual.id, harness.clock.now());

                await harness.clock.advanceAsync(29_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(casual.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, casual);
            });
        }, { enforceRematchCooldown: false });
    });
});
