describe('Grim Resolve', function() {
    integration(function(contextRef) {
        it('Grim Resolve\'s ability should attack with a non-leader unit and grant Grit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['grim-resolve'],
                    groundArena: [{ card: 'battlefield-marine', damage: 2 }, 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grimResolve);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5);

            context.player2.passAction();

            context.player1.moveCard(context.grimResolve, 'hand');
            context.player1.clickCard(context.grimResolve);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(9);
        });
    });
});