describe('Heroic Bravery', function() {
    integration(function(contextRef) {
        it('Heroic Bravery\'s when played ability should give a Shield token to the attached Heroism unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['heroic-bravery'],
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.heroicBravery);
            context.player1.clickCard(context.battlefieldMarine);

            // Battlefield Marine is a Heroism unit, so it receives a Shield token
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['heroic-bravery', 'shield']);
            expect(context.player2).toBeActivePlayer();
        });

        it('Heroic Bravery\'s when played ability should not give a Shield token to a non-Heroism unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['heroic-bravery'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.heroicBravery);
            context.player1.clickCard(context.wampa);

            // Wampa is not a Heroism unit, so no Shield token is given
            expect(context.wampa).toHaveExactUpgradeNames(['heroic-bravery']);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
