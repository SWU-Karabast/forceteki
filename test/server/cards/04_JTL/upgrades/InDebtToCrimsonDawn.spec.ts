
fdescribe('In Debt To Crimson Dawn\'s attached triggered ability', function() {
    integration(function(contextRef) {
        describe('a single upgrade is attached', function() {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['in-debt-to-crimson-dawn'],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: ['frontier-atrt', 'consular-security-force'],
                }
            });
        });

        it('should prompt owner of exhausted unit on regroup to select an option', function () {
            const { context } = contextRef;

            // Attach to player2 unit
            context.player1.clickCard(context.inDebtToCrimsonDawn);
            expect(context.player1).toBeAbleToSelectExactly([
                context.frontierAtrt,
                context.greenSquadronAwing,
                context.consularSecurityForce,
            ]);
            context.player1.clickCard(context.frontierAtrt);

            // CASE 1: Frontier AT-RT attacks and is exhausted
            context.player2.clickCard(context.frontierAtrt);
            context.player2.clickCard(context.p1Base);
            expect(context.frontierAtrt.exhausted).toBeTrue();

            // end phase to start regroup
            context.player1.claimInitiative()
            context.player2.passAction()

            context.player1.clickPrompt('Done');
            context.player2.clickPrompt('Done');


            expect(context.player2).toHaveEnabledPromptButtons(['Pay 2 resource', 'Exhaust it']);
            context.player2.clickPrompt('Exhaust it');

            expect(context.frontierAtrt.exhausted).toBeTrue();
        });

        it('should unexhaust a unit when the player pays 2 resources', function() {
            const { context } = contextRef;

            context.player2.setResourceCount(4)

            // Attach to player2 unit
            context.player1.clickCard(context.inDebtToCrimsonDawn);
            expect(context.player1).toBeAbleToSelectExactly([
                context.frontierAtrt,
                context.greenSquadronAwing,
                context.consularSecurityForce,
            ]);
            context.player1.clickCard(context.frontierAtrt);

            // CASE 1: Frontier AT-RT attacks and is exhausted
            context.player2.clickCard(context.frontierAtrt);
            context.player2.clickCard(context.p1Base);
            expect(context.frontierAtrt.exhausted).toBeTrue();

            // end phase to start regroup
            context.player1.claimInitiative()
            context.player2.passAction()

            context.player1.clickPrompt('Done');
            context.player2.clickPrompt('Done');


            expect(context.player2).toHaveEnabledPromptButtons(['Pay 2 resource', 'Exhaust it']);
            context.player2.clickPrompt('Pay 2 resource');

            expect(context.frontierAtrt.exhausted).toBeFalse();
            expect(context.player2.readyResourceCount).toBe(2);
        })
    })

        it('do something', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['in-debt-to-crimson-dawn', 'in-debt-to-crimson-dawn'],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: ['frontier-atrt', 'consular-security-force'],
                }
            });
            const { context } = contextRef;

            const inDebtToCrimsonDawn1 = context.player1.findCardByName('in-debt-to-crimson-dawn', 'hand')

            // Attach to player2 unit
            context.player1.clickCard(inDebtToCrimsonDawn1);
            expect(context.player1).toBeAbleToSelectExactly([
                context.frontierAtrt,
                context.greenSquadronAwing,
                context.consularSecurityForce,
            ]);
            context.player1.clickCard(context.frontierAtrt);

            context.player2.passAction();

            const inDebtToCrimsonDawn2 = context.player1.findCardByName('in-debt-to-crimson-dawn', 'hand')

            // Attach second upgrade to player2 unit
            context.player1.clickCard(inDebtToCrimsonDawn2);
            expect(context.player1).toBeAbleToSelectExactly([
                context.frontierAtrt,
                context.greenSquadronAwing,
                context.consularSecurityForce,
            ]);
            context.player1.clickCard(context.frontierAtrt);

            // CASE 1: Frontier AT-RT attacks and is exhausted
            context.player2.clickCard(context.frontierAtrt);
            context.player2.clickCard(context.p1Base);
            expect(context.frontierAtrt.exhausted).toBeTrue();

            // end phase to start regroup
            context.player1.claimInitiative()
            context.player2.passAction()

            context.player1.clickPrompt('Done');
            context.player2.clickPrompt('Done');


            expect(context.player2).toHaveEnabledPromptButtons(['Pay 2 resource', 'Exhaust it']);
            context.player2.clickPrompt('Pay 2 resource');

            expect(context.frontierAtrt.exhausted).toBeFalse();
            expect(context.player2.readyResourceCount).toBe(2);
        })

    });
});
