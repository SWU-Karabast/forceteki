describe('Trust Your Instincts', function() {
    integration(function(contextRef) {
        describe('Trust Your Instincts\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        hand: ['trust-your-instincts'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['crosshair#following-orders', 'wampa', 'gentle-giant'],
                        base: { card: 'echo-base', damage: 2 },
                    }
                });
            });

            it('uses the Force and gives a unit +2/+0 with combat damage dealt first', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.trustYourInstincts);
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                expect(context.battlefieldMarine.damage).toBe(0);
            });

            it('uses the Force and gives a unit +2/+0 with combat damage dealt first, but does not prevent if defender lives', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.trustYourInstincts);
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.crosshairFollowingOrders);
                expect(context.battlefieldMarine.damage).toBe(2);
            });

            it('uses the Force and gives a unit +2/+0 with combat damage dealt first, and pump works into base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.trustYourInstincts);
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(7);
            });

            it('uses the Force and gives a unit +2/+0 with combat damage dealt first, surviving grit unit does post grit damage back', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.trustYourInstincts);
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.gentleGiant);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
            });

            it('has no effect if the player does not have the force', function () {
                const { context } = contextRef;
                context.player1.setHasTheForce(false);

                context.player1.clickCard(context.trustYourInstincts);
                context.player1.clickPrompt('Play anyway');

                expect(context.trustYourInstincts).toBeInZone('discard', context.player1);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});