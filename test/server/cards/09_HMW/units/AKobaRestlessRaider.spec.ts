describe('A\'Koba, Restless Raider', function () {
    integration(function (contextRef) {
        it('A\'Koba\'s when played ability must give a unit +2/+0 for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['akoba#restless-raider'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.akoba);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.cartelSpacer, context.akoba]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.getPower()).toBe(6);
            expect(context.wampa.getHp()).toBe(5);

            context.moveToNextActionPhase();

            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
        });
    });
});
