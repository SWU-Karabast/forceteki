describe('Wrecker, Wrecking the Empire', function() {
    integration(function(contextRef) {
        it('Wrecker\'s ability should have each player choose a unit they control and deal 3 damage to each chosen unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wrecker#wrecking-the-empire'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wrecker);

            expect(context.player2).toBeAbleToSelectExactly([context.atst, context.awing]);
            expect(context.player2).not.toHaveChooseNothingButton();
            expect(context.player2).not.toHavePassAbilityButton();
            context.player2.clickCard(context.atst);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.wrecker]);
            expect(context.player2).not.toHaveChooseNothingButton();
            expect(context.player2).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(3);
            expect(context.wampa.damage).toBe(3);
        });

        it('Wrecker\'s ability must choose himself if no others units are available', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wrecker#wrecking-the-empire'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wrecker);

            expect(context.player1).toBeAbleToSelectExactly([context.wrecker]);
            context.player1.clickCard(context.wrecker);

            expect(context.player2).toBeActivePlayer();
            expect(context.wrecker.damage).toBe(3);
        });
    });
});
