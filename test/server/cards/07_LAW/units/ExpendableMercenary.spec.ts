describe('Expendable Mercenary', function () {
    integration(function (contextRef) {
        describe('Expendable Mercenary\'s When Defeated ability', function () {
            describe('basic functionality', function () {
                beforeEach(function () {
                    return contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['expendable-mercenary'],
                            resources: 3
                        },
                        player2: {
                            hand: ['vanquish']
                        }
                    });
                });

                it('should resource itself when defeated and triggered', function () {
                    const { context } = contextRef;

                    context.player1.passAction();

                    context.player2.clickCard(context.vanquish);
                    context.player2.clickCard(context.expendableMercenary);

                    // Should prompt to resource the unit
                    expect(context.player1).toHavePassAbilityPrompt('Resource this unit from its owner\'s discard pile');

                    context.player1.clickPrompt('Trigger');

                    expect(context.expendableMercenary).toBeInZone('resource', context.player1);
                    expect(context.player1.resources.length).toBe(4);
                    expect(context.player1).toBeActivePlayer();
                });

                it('should stay in discard when ability is passed', function () {
                    const { context } = contextRef;

                    context.player1.passAction();

                    context.player2.clickCard(context.vanquish);
                    context.player2.clickCard(context.expendableMercenary);

                    expect(context.player1).toHavePassAbilityPrompt('Resource this unit from its owner\'s discard pile');

                    context.player1.clickPrompt('Pass');

                    expect(context.expendableMercenary).toBeInZone('discard', context.player1);
                    expect(context.player1.resources.length).toBe(3);
                    expect(context.player1).toBeActivePlayer();
                });
            });

            it('should resource to controller when defeated after opponent takes control via No Glory Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['expendable-mercenary'],
                        resources: 3
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                const p2ResourcesBefore = context.player2.resources.length;

                context.player1.passAction();

                // No Glory Only Results takes control and immediately defeats
                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.expendableMercenary);

                // The ability triggers for the controller at time of defeat (player2)
                expect(context.player2).toHavePassAbilityPrompt('Resource this unit from its owner\'s discard pile');

                context.player2.clickPrompt('Trigger');

                // The card gets resourced to the controller's resources (player2)
                expect(context.expendableMercenary).toBeInZone('resource', context.player2);
                expect(context.player2.resources.length).toBe(p2ResourcesBefore + 1);
                expect(context.player1.resources.length).toBe(3);
                expect(context.player1).toBeActivePlayer();
            });

            it('should be resourced by Arquitens if its ability resolves first', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['expendable-mercenary'],
                        resources: 3
                    },
                    player2: {
                        hand: ['swoop-down'],
                        spaceArena: ['arquitens-assault-cruiser'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                const p2ResourcesBefore = context.player2.resources.length;

                context.player1.passAction();

                // Swoop Down allows space unit to attack ground
                context.player2.clickCard(context.swoopDown);
                context.player2.clickCard(context.arquitensAssaultCruiser);
                context.player2.clickCard(context.expendableMercenary);

                // Both players have triggered abilities - player2 (active player) chooses resolution order
                expect(context.player2).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');

                // Let player2 (Arquitens controller) resolve first
                context.player2.clickPrompt('You');

                // Arquitens ability triggers - resources the defeated unit to player2
                expect(context.expendableMercenary).toBeInZone('resource', context.player2);
                expect(context.player2.resources.length).toBe(p2ResourcesBefore + 1);

                // Player1's Expendable Mercenary ability is skipped since card already moved
                expect(context.player1.resources.length).toBe(3);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not be resourced if target by JTL Chimaera ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        groundArena: ['expendable-mercenary'],
                    },
                });

                const { context } = contextRef;

                const p1Resources = context.player1.resources.length;

                context.player1.clickCard(context.chimaera);

                // expendable mercenary is not even selectable because his ability will not work

                expect(context.player2).toBeActivePlayer();
                expect(context.expendableMercenary).toBeInZone('groundArena', context.player1);
                expect(context.player1.resources.length).toBe(p1Resources);
            });
        });
    });
});
