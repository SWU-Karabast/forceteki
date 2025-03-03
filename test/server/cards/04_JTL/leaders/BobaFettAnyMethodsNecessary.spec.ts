
describe('Boba Fett, Any Methods Necessary', function() {
    integration(function(contextRef) {
        describe('Boba Fett, Any Methods Necessary\'s undeployed ability', function() {
            // it('Can Be Deployed As a Unit', async function () {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             leader: 'boba-fett#any-methods-necessary',
            //             spaceArena: ['cartel-spacer'],
            //             resources: 6
            //         },
            //         player2: {
            //             hand: ['rivals-fall']
            //         }
            //     });

            //     const { context } = contextRef;

            //     context.player1.clickCard(context.bobaFett);
            //     expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Boba Fett', 'Deploy Boba Fett as a Pilot']);
            //     context.player1.clickPrompt('Deploy Boba Fett');
            //     expect(context.bobaFett.deployed).toBe(true);
            //     expect(context.bobaFett).toBeInZone('groundArena');
            //     expect(context.bobaFett.getPower()).toBe(4);
            //     expect(context.bobaFett.getHp()).toBe(7);

            //     context.player2.clickCard(context.rivalsFall);
            //     context.player2.clickCard(context.bobaFett);

            //     context.moveToNextActionPhase();
            //     expect(context.bobaFett).not.toHaveAvailableActionWhenClickedBy(context.player1);
            // });

            it('Can Be Deployed As a Pilot Upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#any-methods-necessary',
                        spaceArena: ['cartel-spacer'],
                        resources: 6
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bobaFett);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Deploy Boba Fett', 'Deploy Boba Fett as a Pilot']);
                context.player1.clickPrompt('Deploy Boba Fett as a Pilot');
                expect(context.player2).not.toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.bobaFett.deployed).toBe(true);
                expect(context.bobaFett).toBeInZone('spaceArena');
                expect(context.cartelSpacer.getPower()).toBe(6);
                expect(context.cartelSpacer.getHp()).toBe(7);

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.bobaFett);

                context.moveToNextActionPhase();
                expect(context.bobaFett).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });
    });
});