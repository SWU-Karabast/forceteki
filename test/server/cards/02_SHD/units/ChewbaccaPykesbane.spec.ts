describe('Chewbacca Pykesbane', function () {
    integration(function (contextRef) {
        it('Chewbacca Pykesbane\'s when played ability should allow to defeat a unit with 5 or less HP', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['knight-of-the-republic', { card: 'luminara-unduli#softspoken-master', damage: 5 }, { card: 'the-zillo-beast#awoken-from-the-depths', damage: 4 }],
                    hand: ['chewbacca#pykesbane']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.chewbacca);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.luminaraUnduli]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard');
        });
    });
});
