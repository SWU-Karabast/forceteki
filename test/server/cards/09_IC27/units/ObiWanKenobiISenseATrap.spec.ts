describe('Obi-Wan Kenobi, I Sense a Trap', function() {
    integration(function(contextRef) {
        describe('its When Played ability', function() {
            it('can play a unit that was defeated this phase from your discard pile for 5 resources less', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chewbacca#walking-carpet',
                        hand: ['rivals-fall', 'obiwan-kenobi#i-sense-a-trap'],
                        groundArena: ['armored-saber-tank'],
                        discard: ['wampa'],
                    },
                    player2: {
                        hand: ['takedown'],
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.atst);

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.armoredSaberTank);

                context.player1.clickCard(context.obiwanKenobi);

                context.player1.clickPrompt('Play a unit that was defeated this phase from your discard pile. It costs 5 resources less');

                expect(context.player1).toHavePrompt('Choose a unit that was defeated this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.armoredSaberTank]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.armoredSaberTank);

                // Tank costs 6 → discounted to 1. Total spend: 6 (Rival's Fall) + 8 (Obi-Wan) + 1 = 15
                expect(context.armoredSaberTank).toBeInZone('groundArena');
                expect(context.obiwanKenobi).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(15);
            });

            it('can give an enemy unit that entered play this phase -5/-5 for this phase only', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['obiwan-kenobi#i-sense-a-trap', 'wampa'],
                    },
                    player2: {
                        hand: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player2.clickCard(context.atst);
                context.player1.clickCard(context.obiwanKenobi);

                context.player1.clickPrompt('Choose a unit that entered play this phase. It gets -5/-5 for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.obiwanKenobi, context.atst, context.wampa]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.atst);

                // AT-ST is 6/7 → -5/-5 leaves it at 1/2 — it survives
                expect(context.atst).toBeInZone('groundArena');
                expect(context.atst.getPower()).toBe(1);
                expect(context.atst.getHp()).toBe(2);

                // The modification expires when the phase ends
                context.moveToNextActionPhase();
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
            });

            it('can be declined', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['obiwan-kenobi#i-sense-a-trap'],
                        resources: 14
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.obiwanKenobi);

                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.wampa.getPower()).toBe(4);
                expect(context.obiwanKenobi).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
