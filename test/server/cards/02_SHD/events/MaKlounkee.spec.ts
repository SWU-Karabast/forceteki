describe('MaKlounkee', function() {
    integration(function(contextRef) {
        it('can only return a friendly underworld unit to hand and deal damage to any unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ma-klounkee'],
                    groundArena: ['pyke-sentinel', 'academy-defense-walker'],
                    spaceArena: ['cartel-spacer'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: [{ card: 'imperial-interceptor', upgrades: ['academy-training'] }],
                    leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true },
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });
            const { context } = contextRef;

            context.player1.clickCard('ma-klounkee');
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer]);
            context.player1.clickCard(context.pykeSentinel);
            expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.academyDefenseWalker, context.wampa, context.imperialInterceptor, context.grandMoffTarkin]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(3);
        });

        it('should be able to deal the damage to a friendly unit and if only one selectable handle everything automatically', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ma-klounkee'],
                    groundArena: ['pyke-sentinel', 'academy-defense-walker'],
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });
            const { context } = contextRef;

            context.player1.clickCard('ma-klounkee');
            expect(context.pykeSentinel).toBeInZone('hand');
            expect(context.academyDefenseWalker.damage).toBe(3);
        });

        it('if no underworld units are in play, nothing happens, but resources get exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ma-klounkee'],
                    groundArena: ['academy-defense-walker'],
                    base: 'chopper-base',
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });
            const { context } = contextRef;

            context.player1.clickCard('ma-klounkee');
            context.player1.clickPrompt('Play anyway');
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('should bounce unit if only one available and nothing happens after that', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ma-klounkee'],
                    groundArena: ['pyke-sentinel'],
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });
            const { context } = contextRef;

            context.player1.clickCard('ma-klounkee');
            expect(context.pykeSentinel).toBeInZone('hand');
        });
    });
});
