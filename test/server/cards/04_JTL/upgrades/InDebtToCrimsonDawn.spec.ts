
describe('In Debt To Crimson Dawn\'s attached triggered ability', function() {
    integration(function(contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: [{ card: 'frontier-atrt', upgrades: [{ card: 'in-debt-to-crimson-dawn', ownerAndController: 'player1' }] }, 'consular-security-force'],
                }
            });
        });

        it('should prompt owner of exhausted unit on regroup to select an option', function () {
            const { context } = contextRef;

            context.player1.passAction();

            // CASE 1: Frontier AT-RT attacks and is exhausted
            context.player2.clickCard(context.frontierAtrt);
            context.player2.clickCard(context.p1Base);
            expect(context.frontierAtrt.exhausted).toBeTrue();

            // end phase to start regroup
            context.player1.claimInitiative();
            context.player2.passAction();

            context.player1.clickPrompt('Done');
            context.player2.clickPrompt('Done');


            expect(context.player2).toHaveEnabledPromptButtons(['Pay 2 resource', 'Exhaust it']);
            context.player2.clickPrompt('Exhaust it');

            expect(context.frontierAtrt.exhausted).toBeTrue();
        });

        it('should unexhaust a unit when the player pays 2 resources', function() {
            const { context } = contextRef;
            context.player2.setResourceCount(4);
            context.player1.passAction();

            // CASE 1: Frontier AT-RT attacks and is exhausted
            context.player2.clickCard(context.frontierAtrt);
            context.player2.clickCard(context.p1Base);
            expect(context.frontierAtrt.exhausted).toBeTrue();

            // end phase to start regroup
            context.player1.claimInitiative();
            context.player2.passAction();

            context.player1.clickPrompt('Done');
            context.player2.clickPrompt('Done');


            expect(context.player2).toHaveEnabledPromptButtons(['Pay 2 resource', 'Exhaust it']);
            context.player2.clickPrompt('Pay 2 resource');

            expect(context.frontierAtrt.exhausted).toBeFalse();
            expect(context.player2.readyResourceCount).toBe(2);
        });
    });
});
