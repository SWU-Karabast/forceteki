describe('Lost and Forgotten', function() {
    integration(function(contextRef) {
        describe('Lost and Forgotten\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['lost-and-forgotten'],
                        groundArena: ['pyke-sentinel'],
                        base: { card: 'security-complex', damage: 4 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor', 'lurking-tie-phantom'],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                    }
                });
            });

            it('should defeat an enemy non-leader unit and heal 3 damage from event player base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lostAndForgotten);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa, context.imperialInterceptor, context.lurkingTiePhantom]);

                context.player1.clickCard(context.imperialInterceptor);
                expect(context.imperialInterceptor).toBeInZone('discard');
                expect(context.p1Base.damage).toBe(1);
            });

            it('should defeat a friendly non-leader unit and heal 3 damage from event player base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lostAndForgotten);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa, context.imperialInterceptor, context.lurkingTiePhantom]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.p1Base.damage).toBe(1);
            });

            it('should not heal if there is no defeat', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lostAndForgotten);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.wampa, context.imperialInterceptor, context.lurkingTiePhantom]);

                context.player1.clickCard(context.lurkingTiePhantom);
                expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
                expect(context.p1Base.damage).toBe(4);
            });
        });
    });
});