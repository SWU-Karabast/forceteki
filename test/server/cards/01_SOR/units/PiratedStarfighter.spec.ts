describe('Pirated Starfighter', function () {
    integration(function (contextRef) {
        it('should not prompt player if no units are available to return to hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['pirated-starfighter'],
                    base: 'chopper-base',
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });
            const { context } = contextRef;

            context.player1.clickCard(context.piratedStarfighter);
            expect(context.piratedStarfighter).toBeInZone('hand');
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to return self or other unit to hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['pirated-starfighter'],
                    groundArena: ['pyke-sentinel', 'seasoned-shoretrooper'],
                    leader: { card: 'leia-organa#alliance-general', deployed: true }
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });
            const { context } = contextRef;

            context.player1.clickCard(context.piratedStarfighter);
            expect(context.player1).toBeAbleToSelectExactly([context.piratedStarfighter, context.pykeSentinel, context.seasonedShoretrooper]);
            context.player1.clickCard(context.pykeSentinel);
            expect(context.pykeSentinel).toBeInZone('hand');
            expect(context.piratedStarfighter).toBeInZone('spaceArena');
        });
    });
});
