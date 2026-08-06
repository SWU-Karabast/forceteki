describe('Knobby White Ice Spider', function() {
    integration(function(contextRef) {
        describe('Knobby White Ice Spider\'s when played ability', function() {
            it('should give Advantage tokens equal to the number of enemy units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['knobby-white-ice-spider'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['wampa', 'sundari-peacekeeper', 'wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.knobbyWhiteIceSpider);

                expect(context.player2).toBeActivePlayer();
                expect(context.knobbyWhiteIceSpider).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage', 'advantage']);
            });

            it('should give 0 Advantage tokens when there are no enemy units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['knobby-white-ice-spider'],
                    },
                    player2: {
                        groundArena: [],
                        spaceArena: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.knobbyWhiteIceSpider);

                expect(context.player2).toBeActivePlayer();
                expect(context.knobbyWhiteIceSpider).toHaveExactUpgradeNames([]);
            });
        });
    });
});
