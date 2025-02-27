describe('Avenger, Hunting Star Destroyer', function() {
    integration(function(contextRef) {
        describe('Avenger\'s destroy ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['avenger#hunting-star-destroyer'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['imperial-interceptor'],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer', 'avenger#hunting-star-destroyer'],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                    }
                });

                const { context } = contextRef;
                context.p1Avenger = context.player1.findCardByName('avenger#hunting-star-destroyer');
                context.p2Avenger = context.player2.findCardByName('avenger#hunting-star-destroyer');
            });

            it('forces opponent to defeat friendly non-leader unit when Avenger is played', function () {
                const { context } = contextRef;

                // Play Avenger
                context.player1.clickCard(context.p1Avenger);

                // Player 2 must choose its own unit
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.p2Avenger]);
                context.player2.clickCard(context.cartelSpacer);

                // Chosen unit defeated
                expect(context.cartelSpacer).toBeInZone('discard');
            });

            it('forces opponent to defeat friendly non-leader unit when Avenger attacks', function () {
                const { context } = contextRef;

                context.player2.setActivePlayer();

                // Attack with Avenger, choose base as target
                context.player2.clickCard(context.p2Avenger);
                context.player2.clickCard(context.p1Base);

                // Player 1 must choose its own unit
                expect(context.player1).toBeAbleToSelectExactly([context.imperialInterceptor, context.pykeSentinel]);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.p1Base.damage).toBe(8);
            });

            it('allows the defender to be defeated and end the attack', function () {
                const { context } = contextRef;

                context.player2.setActivePlayer();

                // Attack with Avenger, choose interceptor as target
                context.player2.clickCard(context.p2Avenger);
                context.player2.clickCard(context.imperialInterceptor);

                // Interceptor not yet destroyed
                expect(context.imperialInterceptor).toBeInZone('spaceArena');

                // Player 1 must choose its own unit
                expect(context.player1).toBeAbleToSelectExactly([context.imperialInterceptor, context.pykeSentinel]);

                // Choose the defender and check it was destroyed
                context.player1.clickCard(context.imperialInterceptor);
                expect(context.imperialInterceptor).toBeInZone('discard');

                // Ensure no damage happened
                expect(context.p2Avenger.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
            });
        });
    });
});
