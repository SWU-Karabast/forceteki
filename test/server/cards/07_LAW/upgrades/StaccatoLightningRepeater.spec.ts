describe('Staccato Lightning Repeater', function () {
    integration(function (contextRef) {
        it('Staccato Lightning Repeater should deal 1 damage to each of up to 3 different ground units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['staccato-lightning-repeater'],
                    groundArena: ['wampa'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['atst', 'battlefield-marine', 'battlefield-marine', 'yoda#old-master', 'rey#skywalker'],
                    spaceArena: ['tie-advanced']
                }
            });

            const { context } = contextRef;
            const marines = context.player2.findCardsByName('battlefield-marine');

            context.player1.clickCard(context.staccatoLightningRepeater);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, ...marines, context.yoda, context.rey]);
            context.player1.clickCard(context.wampa);

            expect(context.player1).toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([...marines, context.atst, context.yoda, context.rey, context.wampa]);
            context.player1.clickCard(marines[0]);
            context.player1.clickCard(marines[1]);
            context.player1.clickCard(context.atst);
            context.player1.clickCardNonChecking(context.yoda);

            context.player1.clickDone();

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(1);
            expect(context.yoda.damage).toBe(0);
            expect(context.rey.damage).toBe(0);
            expect(marines[0].damage).toBe(1);
            expect(marines[1].damage).toBe(1);
        });
    });
});
