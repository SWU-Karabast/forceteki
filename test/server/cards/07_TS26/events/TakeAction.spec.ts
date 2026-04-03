describe('Take Action', function () {
    integration(function (contextRef) {
        it('Take Action\'s ability should deal 3 damage to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-action'],
                    groundArena: ['battlefield-marine'],
                    base: 'tarkintown'
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['awing'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeAction);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.awing]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(3);
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });

        it('Take Action\'s ability should costs 1 resource less by friendly leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-action'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    base: 'tarkintown'
                },
                player2: {
                    groundArena: ['wampa'],
                    leader: { card: 'darth-vader#dont-fail-me-again', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeAction);
            expect(context.player1).toBeAbleToSelectExactly([context.chewbacca, context.darthVader, context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(3);
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });
    });
});
