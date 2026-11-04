import fs from 'fs';
import path from 'path';
import { Lobby } from '../../../../server/gamenode/Lobby';
import { mintSessionToken, sessionCookie, signInClaims } from '../../../helpers/server/AuthTokens';
import { FakeIoSocket } from '../../../helpers/server/FakeIoSocket';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import { TestClient } from '../../../helpers/server/TestClient';
import type { IScriptedGameDecision, IScriptedGameLog } from '../../swupgn-writer/scriptedGameDecisions';
import { coinFlipPromptTitle } from '../../swupgn-writer/scriptedGameDecisions';

/**
 * Workload L of the SWU-PGN writer benchmark (`scripts/swupgn-benchmark.js`), the gate G2 is judged on: the scripted
 * games played through a real `GameServer` and `Lobby`, each decision sent by the seat's client as the `game` socket
 * command the web client sends, and every outbound emit encoded as socket.io would encode it. The time measured is the
 * server's own, per decision: what `Lobby.onGameMessage` takes to run the command, continue the game and send both
 * seats their game state. It is printed once at the end as `SWUPGN_LOBBY_MS {json}`.
 *
 * The decisions come from the scripted games' integration run (`SWUPGN_DECISION_LOG`, `scriptedGameDecisions.ts`),
 * since the games choose from the integration harness's view of the game. A prompt's uuid is random, so a decision
 * that names its prompt names the client's current prompt instead, read from the last game state it received.
 *
 * Each game is played `SWUPGN_LOBBY_PASSES` times (default 3), all but the first pass timed.
 *
 * Skipped unless `SWUPGN_BENCHMARK=L`, with `SWUPGN_DECISION_LOG` naming the log of a run in the same writer mode.
 */
const benchmark = process.env.SWUPGN_BENCHMARK === 'L';
const gameSetupsDir = path.resolve(__dirname, '../../../../../test/gameSetups');

// the development test accounts a test game is played between (`GameServer.startTestGame`)
const seats = [
    { id: 'exe66', username: 'Order66', providerId: 'order66' },
    { id: 'th3w4y', username: 'ThisIsTheWay', providerId: 'this-is-the-way' }
];

function readLogs(): Record<string, IScriptedGameLog> {
    const file = process.env.SWUPGN_DECISION_LOG;
    if (!file || !fs.existsSync(file)) {
        throw new Error(`SwuPgnLobbyBenchmark: SWUPGN_DECISION_LOG (${file}) names no decision log; run ScriptedGames.spec with it set first`);
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function promptOf(client: TestClient): { promptUuid?: string; menuTitle?: string } {
    return client.gameState?.players?.[client.id]?.promptState ?? {};
}

/**
 * The client that sends the decision and its arguments, the prompt's uuid replaced by the uuid of the prompt the client
 * is shown now. The coin flip's answer comes from the seat that won this game's flip, giving initiative to the same seat.
 */
function replayOf(decision: IScriptedGameDecision, clients: TestClient[]): { client: TestClient; args: unknown[] } {
    let client = clients[decision.seat - 1];
    let args = decision.args;
    if (decision.initiativeSeat !== undefined) {
        const winner = clients.findIndex((c) => (promptOf(c).menuTitle ?? '').startsWith(coinFlipPromptTitle));
        expect(winner).withContext('a seat won the coin flip')
            .toBeGreaterThan(-1);
        client = clients[winner];
        args = [winner + 1 === decision.initiativeSeat ? 0 : 1, ...args.slice(1)];
    }
    if (decision.promptUuid === '') {
        return { client, args };
    }
    const current = promptOf(client).promptUuid;
    return { client, args: args.map((arg) => (arg === decision.promptUuid ? current : arg)) };
}

// registered only when benchmarking: it needs a decision log, and a describe with no specs fails in jasmine
(benchmark ? describe : () => undefined)('SWU-PGN writer benchmark, workload L: scripted games through the Lobby', function () {
    const time = { decisions: 0, ms: 0, games: 0 };
    const logs = readLogs();
    // every game is played this many times; the first pass warms the server up (a running node is warm) and is not timed
    const passes = Number(process.env.SWUPGN_LOBBY_PASSES ?? '3');
    const warmUpPasses = 1;

    beforeAll(function () {
        FakeIoSocket.encodeOutboundEmits = true;
    });

    afterAll(function () {
        FakeIoSocket.encodeOutboundEmits = false;
        console.log(`\nSWUPGN_LOBBY_MS ${JSON.stringify(time)}`);
    });

    serverIntegration(function (contextRef) {
        afterEach(function () {
            Lobby.gameCommandTimingObserver = null;
        });

        for (let pass = 1; pass <= passes; pass++) {
            for (const [name, log] of Object.entries(logs)) {
                definePlay(name, log, pass);
            }
        }

        function definePlay(name: string, log: IScriptedGameLog, pass: number): void {
            const timed = pass > warmUpPasses;
            it(`${name}, pass ${pass}${timed ? '' : ' (warm-up)'}: every decision is played through the clients' sockets`, async function () {
                const { harness } = contextRef;
                const filename = `swupgn-benchmark-${name}.json`;
                const file = path.join(gameSetupsDir, filename);
                fs.writeFileSync(file, JSON.stringify({ ...log.setup, randomSeed: log.seed }));
                try {
                    const cookie = sessionCookie(mintSessionToken(signInClaims({
                        provider: 'dev-user', providerId: seats[0].providerId, username: seats[0].username, email: 'order66@local.karabast'
                    })));
                    const response = await harness.api.post('/api/start-test-game').set('Cookie', cookie)
                        .send({ filename });
                    expect(response.status).withContext(`${name}: start-test-game`)
                        .toBe(200);
                } finally {
                    fs.rmSync(file, { force: true });
                }

                const clients = seats.map((seat) => TestClient.create(harness, seat.id, { authenticated: true, username: seat.username }));
                for (const client of clients) {
                    await client.connectAsync();
                    expect(client.gameState).withContext(`${name}: ${client.username} has a game state`)
                        .toBeDefined();
                }

                let decisions = 0;
                let ms = 0;
                Lobby.gameCommandTimingObserver = (_command, durationMs) => {
                    decisions++;
                    ms += durationMs;
                };
                for (const decision of log.decisions) {
                    const { client, args } = replayOf(decision, clients);
                    await client.sendGameMessageAsync(decision.command, ...args);
                }
                Lobby.gameCommandTimingObserver = null;

                const state = clients[0].gameState;
                expect(decisions).withContext(`${name}: decisions timed`)
                    .toBe(log.decisions.length);
                expect(state.winners.length).withContext(`${name}: the game ended`)
                    .toBeGreaterThan(0);
                // the replay made the same game: as many chat log messages as the scripted run
                expect(state.totalMessages).withContext(`${name}: chat log messages`)
                    .toBe(log.messages);

                if (timed) {
                    time.decisions += decisions;
                    time.ms += ms;
                    time.games++;
                }
            });
        }
    });
});
