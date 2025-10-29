describe('Guerilla Insurgency', function() {
    integration(function(contextRef) {
        describe('Guerilla Insurgency\'s ability -', function() {
            it('should defeat a friendly and enemy resource, make players to discard 2 cards and deal damage 4 to each ground unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['guerilla-insurgency', 'grim-resolve', 'in-pursuit', 'droid-deployment'],
                        groundArena: ['wampa'],
                        resources: ['cunning', 'aggression', 'spark-of-rebellion', 'protector', 'atst', 'battlefield-marine', 'tieln-fighter', 'death-trooper', 'blood-sport', 'drop-in', 'hello-there'],
                    },
                    player2: {
                        hand: ['pillage', 'force-choke'],
                        groundArena: ['seventh-sister#implacable-inquisitor'],
                        spaceArena: ['corellian-freighter'],
                        resources: ['confiscate', 'restock', 'breaking-in']
                    }
                });

                const { context } = contextRef;

                // Assert initial state
                expect(context.player1.resources.length).toBe(11);
                expect(context.player2.resources.length).toBe(3);

                // Play Guerilla Insurgency
                context.player1.clickCard(context.guerillaInsurgency);

                expect(context.player1).toHavePrompt('Defeat a resource you control');
                expect(context.player1).toBeAbleToSelectExactly([context.cunning, context.aggression, context.sparkOfRebellion, context.protector, context.atst, context.battlefieldMarine, context.tielnFighter, context.deathTrooper, context.bloodSport, context.dropIn, context.helloThere]);
                expect(context.player1).not.toHaveChooseNothingButton();

                // Each player defeats a resource
                context.player1.clickCard(context.cunning);

                expect(context.player2).toHavePrompt('Defeat a resource you control');
                expect(context.player2).toBeAbleToSelectExactly([context.confiscate, context.restock, context.breakingIn]);
                expect(context.player2).not.toHaveChooseNothingButton();
                context.player2.clickCard(context.confiscate);

                // Each player discards 2 cards
                expect(context.player1).toHavePrompt('Choose 2 cards to discard for Guerilla Insurgency\'s effect');
                expect(context.player1).toBeAbleToSelectExactly(['grim-resolve', 'in-pursuit', 'droid-deployment']);
                context.player1.clickCard('grim-resolve');
                expect(context.player1).not.toHavePrompt('Done');
                context.player1.clickCard('in-pursuit');
                context.player1.clickCardNonChecking('droid-deployment');
                context.player1.clickDone();

                expect(context.player2).toHavePrompt('Choose 2 cards to discard for Guerilla Insurgency\'s effect');
                expect(context.player2).toBeAbleToSelectExactly(['force-choke', 'pillage']);
                context.player2.clickCard('force-choke');
                context.player2.clickCard('pillage');
                context.player2.clickDone();

                // Assert defeated resources
                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(2);

                expect(context.cunning).toBeInZone('discard', context.player1);
                expect(context.confiscate).toBeInZone('discard', context.player2);

                // Assert discarded cards
                expect(context.player2.hand.length).toBe(0);
                expect(context.player1.hand.length).toBe(1);
                expect(context.droidDeployment).toBeInZone('hand', context.player1);

                // Assert dealt damage
                expect(context.wampa.damage).toBe(4);
                expect(context.seventhSister.damage).toBe(4);
                expect(context.corellianFreighter.damage).toBe(0); // Space unit should not be affected

                expect(context.getChatLogs(5)).toEqual([
                    'player1 plays Guerilla Insurgency to make player1 defeat a resource, to make player2 defeat a resource, to make themself discard 2 cards and to make player2 discard 2 cards, and to deal 4 damage to Wampa and Seventh Sister',
                    'player1 uses Guerilla Insurgency to defeat a ready Cunning',
                    'player1 uses Guerilla Insurgency to defeat a ready Confiscate',
                    'player1 discards Grim Resolve and In Pursuit from their hand due to Guerilla Insurgency',
                    'player2 discards Force Choke and Pillage from their hand due to Guerilla Insurgency',
                ]);
            });
        });
    });
});
