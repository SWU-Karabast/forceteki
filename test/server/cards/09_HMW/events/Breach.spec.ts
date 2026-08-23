describe('Breach', function() {
    integration(function(contextRef) {
        describe('Breach\'s ability', function() {
            it('should have a friendly unit deals damage equal to its power to an enemy unit in the same arena. As the friendly unit has Overwhelm, excess damage is dealt to enemy base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['breach'],
                        groundArena: ['hijacked-atst']
                    },
                    player2: {
                        groundArena: ['porg', 'wampa'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.breach);

                expect(context.player1).toBeAbleToSelectExactly([context.hijackedAtst]);
                context.player1.clickCard(context.hijackedAtst);

                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.wampa]);
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.porg).toBeInZone('discard', context.player2);
                expect(context.p2Base.damage).toBe(6);
            });

            it('should have a friendly unit deals damage equal to its power to an enemy unit in the same arena. As the friendly unit has Overwhelm, excess damage is dealt to enemy base (space unit)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['breach'],
                        spaceArena: ['devastator#inescapable']
                    },
                    player2: {
                        groundArena: ['porg', 'wampa'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.breach);
                context.player1.clickCard(context.devastator);

                expect(context.player1).toBeAbleToSelectExactly([context.awing]);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('discard', context.player2);
                expect(context.p2Base.damage).toBe(8);
            });

            it('should have a friendly unit deals damage equal to its power to an enemy unit in the same arena. As the friendly unit does not have Overwhelm, no excess damage is dealt to enemy base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['breach'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['porg'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.breach);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.porg).toBeInZone('discard', context.player2);
                expect(context.p2Base.damage).toBe(0);
            });

            it('should have a friendly unit deals damage equal to its power to an enemy unit in the same arena. If there is no excess, nothing is dealt to enemy base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['breach'],
                        groundArena: ['k2so#cassians-counterpart']
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.breach);
                context.player1.clickCard(context.k2so);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
                expect(context.wampa.damage).toBe(4);
            });
        });
    });
});
