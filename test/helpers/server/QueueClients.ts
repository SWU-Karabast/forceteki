import type { MatchmakingCompetitivenessPreference } from '../../../server/game/core/Constants';
import { MatchmakingType } from '../../../server/gamenode/Lobby';
import type { IQueueFormatKey } from '../../../server/gamenode/QueueHandler';
import { premierBestOfOne } from './MatchConfigs';
import type { ServerTestHarness } from './ServerTestHarness';
import type { ITestClientOptions, TestClient } from './TestClient';

/** Has `client` enter the queue with a valid deck for `configuration`, expecting the server to accept it. */
export async function enterQueueAsync(
    harness: ServerTestHarness,
    client: TestClient,
    matchmakingPreference?: MatchmakingCompetitivenessPreference,
    configuration: Readonly<IQueueFormatKey> = premierBestOfOne
): Promise<void> {
    const response = await client.enterQueueAsync({
        ...configuration,
        deck: harness.decklists.validDecklist(configuration),
        matchmakingCompetitivenessPreference: matchmakingPreference,
    });
    expect(response.status).withContext(JSON.stringify(response.body))
        .toBe(200);
    expect(response.body.success).toBeTrue();
}

/** A new client (made with `options`) that has entered the queue and connected its socket, so it is searching. */
export async function queueClientAsync(
    harness: ServerTestHarness,
    matchmakingPreference?: MatchmakingCompetitivenessPreference,
    options: ITestClientOptions = {},
    configuration: Readonly<IQueueFormatKey> = premierBestOfOne
): Promise<TestClient> {
    const client = harness.createClient(options);
    await enterQueueAsync(harness, client, matchmakingPreference, configuration);
    await client.connectAsync();
    return client;
}

/** Expects the two players to have been matched into the same quick lobby, as each of them sees it. */
export function expectMatched(player1: TestClient, player2: TestClient): void {
    const expectedIds = [player1.id, player2.id].sort();
    for (const player of [player1, player2]) {
        expect(player.lobbyState?.gameType).toBe(MatchmakingType.Quick);
        expect(player.lobbyState?.users.map((user: { id: string }) => user.id).sort()).toEqual(expectedIds);
    }
    expect(player1.lobbyState?.id).toBeDefined();
    expect(player2.lobbyState?.id).toBe(player1.lobbyState?.id);
}
