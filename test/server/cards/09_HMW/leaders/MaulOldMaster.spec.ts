describe('Maul, Old Master', function() {
    integration(function(contextRef) {
        describe('Maul\'s leader side ability', function() {
            it('should play a unit from hand for 1 less, then defeat it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#old-master',
                        hand: ['porg'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.maul);
                context.player1.clickPrompt('Play a unit from your hand. It costs 1 resource less. Then, defeat it.');

                expect(context.player1).toBeAbleToSelectExactly([context.porg]);
                context.player1.clickCard(context.porg);

                expect(context.porg).toBeInZone('discard', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.maul.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('should play a unit from hand for 1 less, then defeat it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#old-master',
                        hand: ['val#its-been-a-ride-babe'],
                        groundArena: ['porg'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.maul);
                context.player1.clickPrompt('Play a unit from your hand. It costs 1 resource less. Then, defeat it.');
                context.player1.clickCard(context.val);

                expect(context.player1).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
                expect(context.val).toBeInZone('discard', context.player1);
                expect(context.player1).toHaveEnabledPromptButtons(['Give a Shield token to another friendly unit', 'Give a Shield token to an enemy unit']);
                context.player1.clickPrompt('Give a Shield token to an enemy unit');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);

                expect(context.player1).toBeAbleToSelectExactly([context.porg]);
                context.player1.clickCard(context.porg);
                expect(context.porg).toHaveExactUpgradeNames(['shield']);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Maul\'s when deployed ability', function() {
            it('should play a unit defeated this phase from the discard pile for 5 less', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#old-master',
                        groundArena: ['atst'],
                        spaceArena: ['awing'],
                        discard: ['wampa'],
                        resources: 7,
                        base: 'echo-base'
                    },
                    player2: {
                        hand: ['superlaser-blast'],
                        hasInitiative: true,
                        groundArena: ['wrecker#boom']
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.superlaserBlast);

                // Player 1 deploys Maul and triggers the when deployed ability
                context.player1.clickCard(context.maul);
                context.player1.clickPrompt('Deploy Maul');

                // Resolve Shielded first, then the when deployed trigger
                expect(context.player1).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
                context.player1.clickPrompt('Shielded');

                expect(context.player1).toHavePrompt('Play a unit for 5 resources less');

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.awing]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toBeInZone('groundArena', context.player1);
                expect(context.maul).toBeInZone('groundArena', context.player1);
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(1); // 6-5 = 1
            });

            it('should not play a unit defeated a previous phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#old-master',
                        groundArena: ['battlefield-marine', 'porg'],
                        base: 'echo-base'
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['wrecker#boom']
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.wrecker);
                context.player2.clickCard(context.battlefieldMarine);

                context.moveToNextActionPhase();

                context.player2.clickCard(context.wrecker);
                context.player2.clickCard(context.porg);

                // Player 1 deploys Maul and triggers the when deployed ability
                context.player1.clickCard(context.maul);
                context.player1.clickPrompt('Deploy Maul');
                context.player1.clickPrompt('Shielded');

                expect(context.player1).toBeAbleToSelectExactly([context.porg]);
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.porg).toBeInZone('groundArena', context.player1);
                expect(context.maul).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });
        });
    });
});