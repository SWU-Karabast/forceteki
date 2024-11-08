describe('MaKlounkee', function() {
    integration(function(contextRef) {
        it('can only return a friendly underworld unit to hand and deal damage to any unit', function () {
            contextRef.setupTest({
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
                }
            });
            const { context } = contextRef;

            context.player1.clickCard('ma-klounkee');
            expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer]);
            context.player1.clickCard(context.pykeSentinel);
            expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.academyDefenseWalker, context.wampa, context.imperialInterceptor, context.grandMoffTarkin]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(3);
        });

        it('should be able to deal the damage to a friendly unit and if only one selectable handle everything automatically', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['ma-klounkee'],
                    groundArena: ['pyke-sentinel', 'academy-defense-walker'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard('ma-klounkee');
            expect(context.pykeSentinel).toBeInLocation('hand');
            expect(context.academyDefenseWalker.damage).toBe(3);
        });

        it('if no underworld units are in play, nothing happens, but resources get exhausted', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['ma-klounkee'],
                    groundArena: ['academy-defense-walker'],
                    base: 'chopper-base',
                }
            });
            const { context } = contextRef;

            context.player1.clickCard('ma-klounkee');
            expect(context.player1.countExhaustedResources()).toBe(1);
        });

        it('should bounce unit if only one available and nothing happens after that', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['ma-klounkee'],
                    groundArena: ['pyke-sentinel'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard('ma-klounkee');
            expect(context.pykeSentinel).toBeInLocation('hand');
        });
    });
});
