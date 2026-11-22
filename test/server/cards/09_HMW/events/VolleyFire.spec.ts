describe('Volley Fire', function() {
    integration(function(contextRef) {
        it('Volley Fire\'s ability should deal damage equal to a friendly units Raid to an enemy unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['volley-fire'],
                    groundArena: ['nihil-marauder'],
                    spaceArena: ['lurking-tie-phantom']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['graceful-purrgil']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.volleyFire);

            expect(context.player1).toBeAbleToSelectExactly([context.nihilMarauder, context.lurkingTiePhantom]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.nihilMarauder);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.gracefulPurrgil]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).toHavePrompt('Nihil Marauder deals 3 damage to an enemy unit');
            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('Volley Fire\'s ability should work with Marchion Ro', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['volley-fire'],
                    groundArena: ['nihil-marauder', 'marchion-ro#eye-of-the-nihil'],
                    spaceArena: ['lurking-tie-phantom']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['graceful-purrgil']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.volleyFire);

            context.player1.clickCard(context.nihilMarauder);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.gracefulPurrgil]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).toHavePrompt('Nihil Marauder deals 6 damage to an enemy unit');
            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });

        it('Volley Fire\'s ability should deal damage equal to a friendly units Raid to an enemy unit, choosing a unit without Raid', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['volley-fire'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['graceful-purrgil']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.volleyFire);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.atst.damage).toBe(0);
            expect(context.gracefulPurrgil.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
