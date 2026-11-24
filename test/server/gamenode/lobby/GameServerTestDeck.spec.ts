import { CardPool, SwuGameFormat } from '../../../../server/game/core/Constants';
import { premierBestOfOne } from '../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

/** The development-only test deck, which fills the client's deck field while testing locally. */
describe('GameServer test deck', function () {
    serverIntegration(function (contextRef) {
        it('is a Premier deck by default, which the server accepts for a lobby', async function () {
            const response = await contextRef.harness.api.get('/api/test-deck');

            expect(response.status).toBe(200);
            await expectAsync(contextRef.harness.openLobbyAsync({}, { deck: response.body.deck, connect: false })).toBeResolved();
        });

        it('is built for the format and card pool asked for', async function () {
            const config = { ...premierBestOfOne, format: SwuGameFormat.Open, cardPool: CardPool.Unlimited };
            const response = await contextRef.harness.api.get('/api/test-deck').query({ format: config.format, cardPool: config.cardPool });

            expect(response.status).toBe(200);
            await expectAsync(contextRef.harness.openLobbyAsync({}, { deck: response.body.deck, config, connect: false })).toBeResolved();
        });

        it('is refused for an unknown format', async function () {
            const response = await contextRef.harness.api.get('/api/test-deck').query({ format: 'twilight' });

            expect(response.status).toBe(400);
        });

        it('is refused for a card pool the format does not have', async function () {
            const response = await contextRef.harness.api.get('/api/test-deck').query({ format: SwuGameFormat.Premier, cardPool: CardPool.Unlimited });

            expect(response.status).toBe(400);
        });
    });
});
