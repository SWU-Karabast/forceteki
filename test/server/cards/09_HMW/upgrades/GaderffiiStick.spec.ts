describe('Gaderffii Stick', function() {
    integration(function(contextRef) {
        it('Gaderffii Stick should only be able to attach to a non-vehicle unit with 3 or less power', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['gaderffii-stick'],
                    groundArena: ['wampa', 'battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom', 'graceful-purrgil'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                },
                player2: {
                    groundArena: ['clone-x-assassin', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.gaderffiiStick);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cadBane, context.cloneXAssassin, context.gracefulPurrgil]);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['gaderffii-stick']);

            expect(context.player2).toBeActivePlayer();
        });
    });
});