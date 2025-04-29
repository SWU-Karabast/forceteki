
describe('In Debt To Crimson Dawn', function() {
    integration(function(contextRef) {
        describe('In Debt To Crimson Dawn\'s attached triggered ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'emperor-palpatine#galactic-ruler',
                        hand: ['in-debt-to-crimson-dawn'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: [
                            { card: 'frontier-atrt', damage: 1 },
                            'consular-security-force'
                        ],
                        hand: ['bravado']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.inDebtToCrimsonDawn);
                context.player1.clickCard(context.frontierAtrt);
            });

            it('should prompt controller of exhausted unit on regroup to select an option', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.frontierAtrt);
                context.player2.clickCard(context.p1Base);
                expect(context.frontierAtrt.exhausted).toBeTrue();

                context.player1.claimInitiative();
                context.player2.passAction();

                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                expect(context.player2).toHaveEnabledPromptButtons(['Pay 2 resources', 'Exhaust Frontier AT-RT']);
                context.player2.clickPrompt('Exhaust Frontier AT-RT');

                expect(context.frontierAtrt.exhausted).toBeTrue();
            });

            it('should unexhaust a unit when the controller pays 2 resources', function() {
                const { context } = contextRef;

                context.player2.setResourceCount(4);

                context.player2.clickCard(context.frontierAtrt);
                context.player2.clickCard(context.p1Base);
                expect(context.frontierAtrt.exhausted).toBeTrue();

                context.player1.claimInitiative();
                context.player2.passAction();

                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                expect(context.player2).toHaveEnabledPromptButtons(['Pay 2 resources', 'Exhaust Frontier AT-RT']);
                context.player2.clickPrompt('Pay 2 resources');

                expect(context.frontierAtrt.exhausted).toBeFalse();
                expect(context.player2.readyResourceCount).toBe(2);
            });

            it('should trigger when the unit is readied outside of the regroup phase', function() {
                const { context } = contextRef;
                context.player2.setResourceCount(9);

                context.player2.clickCard(context.frontierAtrt);
                context.player2.clickCard(context.p1Base);
                expect(context.frontierAtrt.exhausted).toBeTrue();

                context.player1.claimInitiative();

                context.player2.clickCard(context.bravado);
                context.player2.clickCard(context.frontierAtrt);

                expect(context.player2).toHaveEnabledPromptButtons(['Pay 2 resources', 'Exhaust Frontier AT-RT']);
                context.player2.clickPrompt('Pay 2 resources');

                expect(context.frontierAtrt.exhausted).toBeFalse();
                expect(context.player2.readyResourceCount).toBe(0);
            });

            it('makes the controller pay 2 resources, even if the unit has changed controller', function () {
                const { context } = contextRef;
                context.player2.passAction();

                // Deploy Emperor Palpatine and take control of the Frontier AT-RT
                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickPrompt('Deploy Emperor Palpatine');
                context.player1.clickCard(context.frontierAtrt);

                context.player2.passAction();

                // Attack with the Frontier AT-RT to exhaust it
                context.player1.clickCard(context.frontierAtrt);
                context.player1.clickCard(context.p2Base);
                expect(context.frontierAtrt.exhausted).toBeTrue();

                // Move to the regroup phase
                context.player2.passAction();
                context.player1.claimInitiative();

                // Click through resourcing step
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // Player 1 should be prompted for In Debt To Crimson Dawn's ability
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 2 resources', 'Exhaust Frontier AT-RT']);
                context.player1.clickPrompt('Pay 2 resources');

                // Player 1 should be the one paying the resources
                expect(context.frontierAtrt.exhausted).toBeFalse();
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });
        });

        it('In Debt To Crimson Dawn\'s attached triggered ability should prompt owner if attached to friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['in-debt-to-crimson-dawn'],
                    spaceArena: ['green-squadron-awing'],
                },
                player2: {
                    groundArena: ['frontier-atrt', 'consular-security-force'],
                    hand: ['bravado']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.inDebtToCrimsonDawn);
            context.player1.clickCard(context.greenSquadronAwing);

            context.player2.passAction();

            context.player1.clickCard(context.greenSquadronAwing);
            context.player1.clickCard(context.p2Base);

            context.player2.claimInitiative();
            context.player1.passAction();

            context.player2.clickPrompt('Done');
            context.player1.clickPrompt('Done');

            expect(context.player1).toHaveEnabledPromptButtons(['Pay 2 resources', 'Exhaust Green Squadron A-Wing']);
            context.player1.clickPrompt('Exhaust Green Squadron A-Wing');

            expect(context.greenSquadronAwing.exhausted).toBeTrue();
        });
    });
});
