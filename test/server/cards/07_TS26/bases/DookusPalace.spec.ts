describe('Dooku\'s Palace', function() {
    integration(function(contextRef) {
        describe('Dooku\'s Palace\'s Epic Action', function() {
            it('should play a unit from hand with cost reduced by 1 for each friendly leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'dookus-palace',
                        leader: { card: 'captain-rex#fighting-for-his-brothers', deployed: true },
                        hand: ['battlefield-marine', 'mastery', 'fulcrum', 'awing'],
                    },
                    player2: {
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dookusPalace);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.dookusPalace.epicActionSpent).toBeTrue();
            });

            it('should not decrease cost if there no friendly leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'dookus-palace',
                        leader: { card: 'captain-rex#fighting-for-his-brothers', deployed: false },
                        hand: ['battlefield-marine', 'mastery', 'fulcrum', 'awing'],
                    },
                    player2: {
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dookusPalace);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.dookusPalace.epicActionSpent).toBeTrue();
            });
        });
    });
});
