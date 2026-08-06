describe('Long Live the Empire', function() {
    integration(function(contextRef) {
        it('should defeat a friendly imperial unit and then resource the top card of the deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['long-live-the-empire'],
                    groundArena: ['fifth-brother#fear-hunter'],
                    spaceArena: [{ card: 'awing', upgrades: ['shield'] }],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    deck: ['resupply'],
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.longLiveTheEmpire);
            expect(context.player1).toHavePrompt('Defeat a friendly Imperial unit');
            expect(context.player1).toBeAbleToSelectExactly([context.fifthBrother, context.grandInquisitor]);

            context.player1.clickCard(context.fifthBrother);

            expect(context.player2).toBeActivePlayer();
            expect(context.fifthBrother).toBeInZone('discard', context.player1);
            expect(context.resupply).toBeInZone('resource', context.player1);
        });

        it('should defeat a friendly imperial leader unit and then resource the top card of the deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['long-live-the-empire'],
                    groundArena: ['fifth-brother#fear-hunter'],
                    spaceArena: [{ card: 'awing', upgrades: ['shield'] }],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    deck: ['resupply'],
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.longLiveTheEmpire);
            expect(context.player1).toHavePrompt('Defeat a friendly Imperial unit');
            expect(context.player1).toBeAbleToSelectExactly([context.fifthBrother, context.grandInquisitor]);

            context.player1.clickCard(context.grandInquisitor);

            expect(context.player2).toBeActivePlayer();
            expect(context.grandInquisitor.deployed).toBe(false);
            expect(context.resupply).toBeInZone('resource', context.player1);
        });

        it('should defeat a friendly imperial unit and then not break if there are no cards in the deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['long-live-the-empire'],
                    groundArena: ['fifth-brother#fear-hunter'],
                    spaceArena: [{ card: 'awing', upgrades: ['shield'] }],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    deck: []
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] }
                }
            });

            const { context } = contextRef;

            const startingResources = context.player1.resources.length;

            context.player1.clickCard(context.longLiveTheEmpire);
            expect(context.player1).toHavePrompt('Defeat a friendly Imperial unit');
            expect(context.player1).toBeAbleToSelectExactly([context.fifthBrother, context.grandInquisitor]);

            context.player1.clickCard(context.grandInquisitor);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.resources.length).toBe(startingResources);
            expect(context.grandInquisitor.deployed).toBe(false);
        });

        it('should not resource the top card of the deck if nothing is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['long-live-the-empire'],
                    spaceArena: [{ card: 'awing', upgrades: ['shield'] }],
                    leader: 'grand-inquisitor#hunting-the-jedi',
                    deck: ['resupply']
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['pointless-to-resist'] }],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, upgrades: ['fulcrum'] }
                }
            });

            const { context } = contextRef;

            const startingResources = context.player1.resources.length;

            context.player1.clickCard(context.longLiveTheEmpire);
            context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.resources.length).toBe(startingResources);
        });
    });
});