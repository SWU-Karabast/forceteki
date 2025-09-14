describe('PreMor Personnel Carrier', function() {
    integration(function(contextRef) {
        it('when played, gives itself an Experience token for each ground unit you control', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['premor-personnel-carrier'],
                    groundArena: ['battlefield-marine', 'wampa'],
                    spaceArena: ['green-squadron-awing']
                },
            });

            const { context } = contextRef;

            // Play the space unit
            context.player1.clickCard(context.premorPersonnelCarrier);

            // It should enter the space arena
            expect(context.premorPersonnelCarrier).toBeInZone('spaceArena');

            // We control 2 ground units -> should receive 2 experience tokens
            expect(context.premorPersonnelCarrier).toHaveExactUpgradeNames(['experience', 'experience']);

            // Priority passes
            expect(context.player2).toBeActivePlayer();
        });

        it('gives no Experience tokens if you control no ground units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['premor-personnel-carrier']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.premorPersonnelCarrier);

            expect(context.premorPersonnelCarrier).toBeInZone('spaceArena');
            expect(context.premorPersonnelCarrier.isUpgraded()).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });
    });
});