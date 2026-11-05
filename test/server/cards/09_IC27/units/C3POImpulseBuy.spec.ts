describe('C-3PO, Impulse Buy', function () {
    integration(function (contextRef) {
        it('C-3PO\'s ability should give an Experience token to another unit and draw a card if it has 6 or more power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resupply'],
                    groundArena: ['c3po#impulse-buy', 'atst', 'wampa'],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            const initialHandSize = context.player1.handSize;

            context.player1.clickCard(context.c3po);
            context.player1.clickPrompt('Give an Experience token to another unit. Then, if it has 6 or more power, draw a card');

            // Can target any unit except C-3PO himself
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.atst);

            // AT-ST has 6 power, so a card is drawn
            expect(context.atst).toHaveExactUpgradeNames(['experience']);
            expect(context.c3po.exhausted).toBe(true);
            expect(context.player1.handSize).toBe(initialHandSize + 1);
            expect(context.player2).toBeActivePlayer();
        });

        it('C-3PO\'s ability should draw a card when the Experience token is given to an enemy unit with 6 or more power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['c3po#impulse-buy'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            const initialHandSize = context.player1.handSize;

            context.player1.clickCard(context.c3po);
            context.player1.clickPrompt('Give an Experience token to another unit. Then, if it has 6 or more power, draw a card');
            context.player1.clickCard(context.atst);

            // The enemy AT-ST has 6 power, so player 1 still draws
            expect(context.atst).toHaveExactUpgradeNames(['experience']);
            expect(context.c3po.exhausted).toBe(true);
            expect(context.player1.handSize).toBe(initialHandSize + 1);
            expect(context.player2).toBeActivePlayer();
        });

        it('C-3PO\'s ability should draw a card when the Experience token brings the unit to 6 power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['c3po#impulse-buy', 'coruscant-undercity-police'],
                }
            });

            const { context } = contextRef;

            const initialHandSize = context.player1.handSize;

            context.player1.clickCard(context.c3po);
            context.player1.clickPrompt('Give an Experience token to another unit. Then, if it has 6 or more power, draw a card');
            context.player1.clickCard(context.coruscantUndercityPolice);

            // Coruscant Undercity Police goes from 5 to 6 power with the token, so a card is drawn
            expect(context.coruscantUndercityPolice).toHaveExactUpgradeNames(['experience']);
            expect(context.c3po.exhausted).toBe(true);
            expect(context.player1.handSize).toBe(initialHandSize + 1);
            expect(context.player2).toBeActivePlayer();
        });

        it('C-3PO\'s ability should give an Experience token to another unit but not draw a card if it has less than 6 power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resupply'],
                    groundArena: ['c3po#impulse-buy', 'wampa'],
                }
            });

            const { context } = contextRef;

            const initialHandSize = context.player1.handSize;

            context.player1.clickCard(context.c3po);
            context.player1.clickPrompt('Give an Experience token to another unit. Then, if it has 6 or more power, draw a card');
            context.player1.clickCard(context.wampa);

            // Wampa goes to 5 power with the Experience token, so no card is drawn
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            expect(context.c3po.exhausted).toBe(true);
            expect(context.player1.handSize).toBe(initialHandSize);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
