describe('Hyperspace Disaster', function() {
    integration(function(contextRef) {
        it('Hyperspace Disaster\'s ability should defeat all space units but not ground units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['hyperspace-disaster'],
                    groundArena: ['atst'],
                    spaceArena: ['cartel-spacer'],
                    leader: { card: 'boba-fett#daimyo', deployed: true }
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['alliance-xwing', 'lurking-tie-phantom'],
                    leader: 'luke-skywalker#hero-of-yavin',
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.lukeSkywalker);
            context.player2.clickPrompt('Deploy Luke Skywalker as a Pilot');
            context.player2.clickCard(context.allianceXwing);

            context.player1.clickCard(context.hyperspaceDisaster);

            // Space units from both players are defeated
            expect(context.cartelSpacer).toBeInZone('discard');
            expect(context.allianceXwing).toBeInZone('discard');
            expect(context.lukeSkywalker.deployed).toBeFalse();

            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');

            // Ground units remain
            expect(context.atst).toBeInZone('groundArena');
            expect(context.wampa).toBeInZone('groundArena');

            // Deployed leaders on ground remain deployed on ground
            expect(context.bobaFett).toBeInZone('groundArena');
        });
    });
});
