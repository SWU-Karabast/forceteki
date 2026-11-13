import {
    MatchmakingCompetitivenessPreference,
    MatchmakingCompetitivenessPreferenceSearchStage
} from '../../../../server/game/core/Constants';
import { Lobby } from '../../../../server/gamenode/Lobby';
import { enterQueueAsync, expectMatched, queueClientAsync } from '../../../helpers/server/QueueClients';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

/**
 * What the queue does as a queued player's socket comes and goes: when the search starts, a reconnect or a refresh
 * inside the grace window, a socket that does not come back, a search cancelled on purpose, and requeueing after a game
 * or after the opponent drops during the countdown. The refactor-readiness checklist's rows C14, C19, D1 (for the queue),
 * D5 and D6. Which players are matched, and when, is in `GameServerMatchmaking`.
 */
describe('Queue connections', function () {
    serverIntegration(function (contextRef) {
        it('takes a player who leaves the queue on purpose out of it at once', async function () {
            const { harness } = contextRef;
            const leaver = await queueClientAsync(harness);

            await leaver.manualDisconnectAsync();
            const newcomer = await queueClientAsync(harness);
            await harness.clock.advanceAsync(30_000);

            expect(newcomer.lobbyState).withContext('not matched with the player who left')
                .toBeUndefined();
        });

        describe('search lifecycle', function () {
            it('starts waiting time on the first socket connection rather than the HTTP request', async function () {
                const { harness } = contextRef;
                const competitive = harness.createClient();
                await enterQueueAsync(harness, competitive, MatchmakingCompetitivenessPreference.Competitive);
                await harness.clock.advanceAsync(30_000);
                await competitive.connectAsync();
                const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);

                expect(competitive.queueMatchmakingStatus.searchStartedAt).toBe(harness.clock.now());
                expect(competitive.queueMatchmakingStatus.competitiveness.stage).toBe(MatchmakingCompetitivenessPreferenceSearchStage.SamePreferenceOnly);
                expect(competitive.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(14_999);
                expect(competitive.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, noPreference);
            });

            it('preserves search age through reconnects and survives the old socket\'s disconnect timeout', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);
                const searchStartedAt = harness.clock.now();
                await harness.clock.advanceAsync(10_000);
                await competitive.disconnectTransportAsync();
                await harness.clock.advanceAsync(1_000);
                await competitive.connectAsync();

                expect(competitive.previousSocket.connected).toBeFalse();
                expect(competitive.queueMatchmakingStatus).toEqual(jasmine.objectContaining({
                    searchStartedAt,
                    competitiveness: jasmine.objectContaining({
                        preference: MatchmakingCompetitivenessPreference.Competitive,
                        stage: MatchmakingCompetitivenessPreferenceSearchStage.SamePreferenceOnly,
                        nextExpansionAt: searchStartedAt + 13_500,
                    }),
                }));

                await harness.clock.advanceAsync(3_999);
                expect(competitive.lobbyState).toBeUndefined();
                expect(competitive.isConnected).toBeTrue();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, noPreference);
            });

            it('preserves search context when a refresh replaces an otherwise connected socket', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const searchStartedAt = harness.clock.now();
                await harness.clock.advanceAsync(5_000);
                await competitive.connectAsync();

                expect(competitive.previousSocket.connected).toBeFalse();
                expect(competitive.isConnected).toBeTrue();
                expect(competitive.queueMatchmakingStatus).toEqual(jasmine.objectContaining({
                    searchStartedAt,
                    competitiveness: jasmine.objectContaining({
                        preference: MatchmakingCompetitivenessPreference.Competitive,
                        nextExpansionAt: searchStartedAt + 13_500,
                    }),
                }));
            });

            it('preserves an elapsed expansion grace on reconnect instead of imposing another delay', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const searchStartedAt = harness.clock.now();
                await harness.clock.advanceAsync(17_000);
                await competitive.disconnectTransportAsync();
                await harness.clock.advanceAsync(1_000);
                await competitive.connectAsync();

                expect(competitive.queueMatchmakingStatus.searchStartedAt).toBe(searchStartedAt);
                const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);

                expectMatched(competitive, noPreference);
            });

            it('announces an expansion missed during disconnection and waits before matching on reconnection', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);
                const searchStartedAt = harness.clock.now();
                await harness.clock.advanceAsync(12_500);
                await competitive.disconnectTransportAsync();
                await harness.clock.advanceAsync(2_000);

                expect(noPreference.lobbyState).toBeUndefined();
                await competitive.connectAsync();
                expect(competitive.queueMatchmakingStatus.searchStartedAt).toBe(searchStartedAt);
                expect(competitive.queueMatchmakingStatus.competitiveness.stage).toBe(MatchmakingCompetitivenessPreferenceSearchStage.IncludesNoPreference);
                expect(competitive.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1_499);
                expect(competitive.lobbyState).toBeUndefined();
                await harness.clock.advanceAsync(1);
                expectMatched(competitive, noPreference);
            });

            it('removes an unreconnected queue entry at the end of the three-second grace window', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                await competitive.disconnectTransportAsync();
                await harness.clock.advanceAsync(3_000);
                await competitive.connectAsync();

                expect(competitive.isConnected).toBeFalse();
                expect(competitive.connectionErrors).toEqual(['Connection error, please try again']);
            });

            it('starts a new clock and accepts a new preference on a fresh form submission', async function () {
                const { harness } = contextRef;
                const client = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                await harness.clock.advanceAsync(20_000);
                await enterQueueAsync(harness, client, MatchmakingCompetitivenessPreference.Casual);
                await client.connectAsync();

                expect(client.queueMatchmakingStatus).toEqual(jasmine.objectContaining({
                    searchStartedAt: harness.clock.now(),
                    competitiveness: jasmine.objectContaining({
                        preference: MatchmakingCompetitivenessPreference.Casual,
                        stage: MatchmakingCompetitivenessPreferenceSearchStage.SamePreferenceOnly,
                        nextExpansionAt: harness.clock.now() + 13_500,
                    }),
                }));
            });

            it('removes an explicitly cancelled search and protects a fresh search from its old deadline', async function () {
                const { harness } = contextRef;
                const competitive = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);
                await harness.clock.advanceAsync(14_000);
                await competitive.manualDisconnectAsync();
                await enterQueueAsync(harness, competitive, MatchmakingCompetitivenessPreference.Competitive);
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
                    const player = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual);
                    await harness.clock.advanceAsync(20_000);
                    const opponent = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Casual);
                    expectMatched(player, opponent);
                    await harness.clock.advanceAsync(Lobby.QuickLobbyCountdownMs);
                    expect(player.gameState).toBeDefined();
                    if (reconnectBeforeRequeue) {
                        await player.connectAsync();
                    }
                    await player.concedeAsync();
                    expect(player.gameState.winners).toHaveSize(1);
                    await harness.clock.advanceAsync(1_000);
                    await player.requeueAsync();
                    await harness.clock.settlePendingWorkAsync();
                    const searchStartedAt = harness.clock.now();

                    expect(player.queueMatchmakingStatus).toEqual(jasmine.objectContaining({
                        searchStartedAt,
                        competitiveness: jasmine.objectContaining({
                            preference: MatchmakingCompetitivenessPreference.Casual,
                            stage: MatchmakingCompetitivenessPreferenceSearchStage.SamePreferenceOnly,
                            nextExpansionAt: searchStartedAt + 13_500,
                        }),
                    }));
                    const noPreference = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);
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
                    const player = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.Competitive);
                    const searchStartedAt = harness.clock.now();
                    await harness.clock.advanceAsync(15_000);
                    const opponent = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);
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
                        searchStartedAt,
                        competitiveness: jasmine.objectContaining({
                            preference: MatchmakingCompetitivenessPreference.Competitive,
                            stage: MatchmakingCompetitivenessPreferenceSearchStage.IncludesNoPreference,
                            nextExpansionAt: searchStartedAt + 28_500,
                        }),
                    }));

                    const replacement = await queueClientAsync(harness, MatchmakingCompetitivenessPreference.NoPreference);
                    expectMatched(player, replacement);
                });
            }
        });
    });
});
