describe('Ziton Moj, Black Sun Bully', function() {
    integration(function(contextRef) {
        it('Ziton Moj\'s ability should deal 2 damage to a base when claiming initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ziton-moj#black-sun-bully'],
                },
            });

            const { context } = contextRef;

            context.player1.claimInitiative();

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Ziton Moj\'s ability should not deal 2 damage to a base when opponent claims initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ziton-moj#black-sun-bully'],
                },
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.claimInitiative();

            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);

            expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            expect(context.player2).toHavePrompt('Select between 0 and 1 cards to resource');
        });

        it('Ziton Moj\'s ability should deal 2 damage to a base when opponent claims initiative while Ziton is under his control', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ziton-moj#black-sun-bully'],
                },
                player2: {
                    hand: ['change-of-heart'],
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.zitonMoj);
            context.player1.passAction();
            context.player2.claimInitiative();

            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(2);
        });
    });
});