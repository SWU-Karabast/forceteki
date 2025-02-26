describe('Altering the Deal', function() {
    integration(function(contextRef) {
        it('Altering the Deal\'s event ability should discard a card guarded by a friendly unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['altering-the-deal'],
                    groundArena: ['pyke-sentinel', { card: 'discerning-veteran', capturedUnits: ['snowspeeder', 'specforce-soldier'] }],
                    spaceArena: [{ card: 'tieln-fighter', capturedUnits: ['ruthless-raider'] }]
                },
                player2: {
                    groundArena: [{ card: 'discerning-veteran', capturedUnits: ['wampa', 'atst'] }],
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;

            // TEST: can't select friendly cards (Wampa, AT-ST) guarded by enemy unit
            context.player1.clickCard(context.alteringTheDeal);
            expect(context.player1).toBeAbleToSelectExactly([context.ruthlessRaider, context.snowspeeder, context.specforceSoldier]);
            context.player1.clickCard(context.ruthlessRaider);
            expect(context.ruthlessRaider).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
