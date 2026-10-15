import fs from 'fs';
import os from 'os';
import path from 'path';
import { serverIntegration } from '../../helpers/server/ServerIntegrationHelper';

const gameSetupsDir = path.resolve(__dirname, '../../../../test/gameSetups');

describe('GameServer test game setups', function () {
    serverIntegration(function (contextRef) {
        function lobbyCount(): number {
            return (contextRef.harness.server as any).lobbies.size;
        }

        it('starts a game from a file in test/gameSetups', async function () {
            const response = await contextRef.harness.api
                .post('/api/start-test-game')
                .send({ filename: 'testGameTemplate.json' });

            expect(response.status).toBe(200);
            expect(lobbyCount()).toBe(1);
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
                    .send({ filename: path.relative(gameSetupsDir, outsideFile) });

                expect(response.status).toBe(500);
                expect(lobbyCount()).toBe(0);
            });
        });
    });
});
