describe('Contempt for Culture', function() {
    integration(function(contextRef) {
        it('Contempt for Culture\'s ability should deal 2 damage to a non-vehicle unit and create a spy token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['contempt-for-culture'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.contemptForCulture);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.damage).toBe(2);

            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(1);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies.every((spy) => spy.exhausted)).toBeTrue();
        });
    });
});