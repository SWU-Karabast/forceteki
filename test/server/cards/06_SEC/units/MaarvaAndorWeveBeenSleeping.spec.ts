describe('Maarva Andor, We\'ve Been Sleeping', function() {
    integration(function(contextRef) {
        it('should give an Experience token to each friendly Rebel unit when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['maarva-andor#weve-been-sleeping', 'admiral-ackbar#brilliant-strategist', 'wampa']
                },
                player2: {
                    leader: { card: 'mace-windu#vaapad-form-master', deployed: true },
                    groundArena: ['battlefield-marine'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // Opponent defeats Maarva
            context.player2.clickCard(context.maceWindu);
            context.player2.clickCard(context.maarvaAndor);

            // Rebel leader (Ackbar) should get an Experience token
            expect(context.admiralAckbar).toHaveExactUpgradeNames(['experience']);

            // Non-Rebel (Wampa) should not receive one
            expect(context.wampa.isUpgraded()).toBeFalse();

            // Enemy Rebel (Battlefield Marine) should not receive one
            expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
        });
    });
});
