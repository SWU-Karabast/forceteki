import fs from 'fs';
import os from 'os';
import path from 'path';
import { Lobby } from '../../../../server/gamenode/Lobby';
import { mintSessionToken, sessionCookie, signInClaims } from '../../../helpers/server/AuthTokens';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

const devCookie = sessionCookie(mintSessionToken(signInClaims({ provider: 'dev-user', providerId: 'order66', username: 'Order66', email: 'order66@local.karabast' })));

const gameSetupsDir = path.resolve(__dirname, '../../../../../test/gameSetups');

describe('GameServer test game setups', function () {
    serverIntegration(function (contextRef) {
        function lobbyCount(): number {
            return contextRef.harness.server.lobbyCount;
        }

        it('starts a game from a file in test/gameSetups', async function () {
            const response = await contextRef.harness.api
                .post('/api/start-test-game')
                .set('Cookie', devCookie)
                .send({ filename: 'testGameTemplate.json' });

            expect(response.status).toBe(200);
            expect(lobbyCount()).toBe(1);
        });

        it('refuses requests without a session before allocating a lobby', async function () {
            const response = await contextRef.harness.api.post('/api/start-test-game')
                .send({ filename: 'testGameTemplate.json', user: { id: 'exe66', username: 'Order66', authenticated: true } });
            expect(response.status).toBe(401);
            expect(lobbyCount()).toBe(0);
        });

        it('rejects forged body identity and a supplied userId even with a valid OAuth session', async function () {
            const cookie = sessionCookie(mintSessionToken({
                ...signInClaims({ provider: 'google', providerId: 'attacker', username: 'Order66', email: 'attacker@example.test' }),
                userId: 'exe66',
            }));
            const response = await contextRef.harness.api.post('/api/start-test-game').set('Cookie', cookie)
                .send({ filename: 'testGameTemplate.json', user: { id: 'exe66', username: 'Order66', authenticated: true } });
            expect(response.status).toBe(500);
            expect(lobbyCount()).toBe(0);
        });

        it('uses the stored identity when a test user supplies a different username', async function () {
            const response = await contextRef.harness.api.post('/api/start-test-game').set('Cookie', devCookie)
                .send({ filename: 'testGameTemplate.json', user: { id: 'fake', username: 'FakeName', authenticated: true } });
            expect(response.status).toBe(200);
            expect(contextRef.harness.server.testLobbyFor('exe66')).toBeDefined();
            expect(contextRef.harness.server.testLobbyFor('th3w4y')).toBeDefined();
            expect(contextRef.harness.server.testLobbyFor('fake')).toBeUndefined();
        });

        it('discards the lobby and its timers if game initialization fails', async function () {
            spyOn(Lobby.prototype, 'startTestGameAsync').and.rejectWith(new Error('Invalid setup'));
            const cleanup = spyOn(Lobby.prototype, 'cleanLobby').and.callThrough();
            const response = await contextRef.harness.api.post('/api/start-test-game').set('Cookie', devCookie)
                .send({ filename: 'testGameTemplate.json' });
            expect(response.status).toBe(500);
            expect(lobbyCount()).toBe(0);
            expect(contextRef.harness.server.testLobbyFor('exe66')).toBeUndefined();
            expect(cleanup).toHaveBeenCalledTimes(1);
        });

        describe('with a setup file outside test/gameSetups', function () {
            let outsideDir: string;
            let outsideFile: string;

            beforeEach(function () {
                outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), 'forceteki-game-setup-'));
                outsideFile = path.join(outsideDir, 'outsideSetup.json');
                fs.copyFileSync(path.join(gameSetupsDir, 'testGameTemplate.json'), outsideFile);
            });

            afterEach(function () {
                fs.rmSync(outsideDir, { recursive: true, force: true });
            });

            it('refuses a filename that paths out of the directory', async function () {
                const response = await contextRef.harness.api
                    .post('/api/start-test-game')
                    .set('Cookie', devCookie)
                    .send({ filename: path.relative(gameSetupsDir, outsideFile) });

                expect(response.status).toBe(500);
                expect(lobbyCount()).toBe(0);
            });
        });
    });
});

describe('Database-backed development test games', function () {
    serverIntegration(function (contextRef) {
        it('uses existing OAuth-linked IDs even after the test accounts are renamed', async function () {
            const response = await contextRef.harness.api.post('/api/start-test-game').set('Cookie', devCookie)
                .send({ filename: 'testGameTemplate.json' });
            expect(response.status).toBe(200);
            expect(contextRef.harness.server.testLobbyFor('existing-order-account')).toBeDefined();
            expect(contextRef.harness.server.testLobbyFor('existing-way-account')).toBeDefined();
            expect(contextRef.harness.server.testLobbyFor('exe66')).toBeUndefined();
        });
    }, { database: (db) => {
        db.seedAccount({ id: 'existing-order-account', provider: 'dev-user', providerId: 'order66', username: 'RenamedOrder' });
        db.seedAccount({ id: 'existing-way-account', provider: 'dev-user', providerId: 'this-is-the-way', username: 'RenamedWay' });
    } });

    serverIntegration(function (contextRef) {
        it('honors the games-disabled maintenance switch', async function () {
            const response = await contextRef.harness.api.post('/api/start-test-game').set('Cookie', devCookie)
                .send({ filename: 'testGameTemplate.json' });
            expect(response.status).toBe(503);
            expect(contextRef.harness.server.lobbyCount).toBe(0);
        });
    }, { database: (db) => db.seedSettings({ gamesEnabled: false }) });
});
