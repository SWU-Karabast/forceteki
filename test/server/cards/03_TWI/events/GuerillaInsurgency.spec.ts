describe('GuerillaI nsurgency', function() {
    integration(function(contextRef) {
        describe('Guerilla Insurgency\'s ability -', function() {
            it('should defeat a friendly and enemy resource, make players to discard 2 cards and deal damage 4 to each ground unit', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['guerilla-insurgency', 'grim-resolve', 'in-pursuit'],
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
                expect(context.player1).not.toHaveChooseNoTargetButton();

                // Each player defeats a resource
                context.player1.clickCard(context.cunning);

                expect(context.player2).toHavePrompt('Defeat a resource you control');
                expect(context.player2).toBeAbleToSelectExactly([context.confiscate, context.restock, context.breakingIn]);
                expect(context.player1).not.toHaveChooseNoTargetButton();
                context.player2.clickCard(context.confiscate);

                // Each player discards 2 cards
                expect(context.player1).toHavePrompt('Choose 2 cards to discard');
                expect(context.player1).toBeAbleToSelectExactly(['grim-resolve', 'in-pursuit']);
                context.player1.clickCard('grim-resolve');
                context.player1.clickCard('in-pursuit');
                context.player1.clickPrompt('Done');

                expect(context.player2).toHavePrompt('Choose 2 cards to discard');
                expect(context.player2).toBeAbleToSelectExactly(['force-choke', 'pillage']);
                context.player2.clickCard('force-choke');
                context.player2.clickCard('pillage');
                context.player2.clickPrompt('Done');

                // Assert defeated resources
                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(2);

                expect(context.cunning).toBeInZone('discard', context.player1);
                expect(context.confiscate).toBeInZone('discard', context.player2);

                // Assert discarded cards
                expect(context.player2.hand.length).toBe(0);
                expect(context.player1.hand.length).toBe(0);

                // Assert dealt damage
                expect(context.wampa.damage).toBe(4);
                expect(context.seventhSister.damage).toBe(4);
                expect(context.corellianFreighter.damage).toBe(0); // Space unit should not be affected
            });

            it('should defeat a friendly and enemy resource, only opponent discards a card and deal damage 4 to each ground unit', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['guerilla-insurgency'],
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
                expect(context.player1).not.toHaveChooseNoTargetButton();

                // Each player defeats a resource
                context.player1.clickCard(context.cunning);

                expect(context.player2).toHavePrompt('Defeat a resource you control');
                expect(context.player2).toBeAbleToSelectExactly([context.confiscate, context.restock, context.breakingIn]);
                expect(context.player1).not.toHaveChooseNoTargetButton();
                context.player2.clickCard(context.confiscate);

                // Each player discards 2 cards
                expect(context.player2).toHavePrompt('Choose 2 cards to discard');
                expect(context.player2).toBeAbleToSelectExactly(['force-choke', 'pillage']);
                context.player2.clickCard('force-choke');
                context.player2.clickCard('pillage');
                context.player2.clickPrompt('Done');

                // Assert defeated resources
                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(2);

                expect(context.cunning).toBeInZone('discard', context.player1);
                expect(context.confiscate).toBeInZone('discard', context.player2);

                // Assert dealt damage
                expect(context.wampa.damage).toBe(4);
                expect(context.seventhSister.damage).toBe(4);
                expect(context.corellianFreighter.damage).toBe(0); // Space unit should not be affected
            });

            it('should defeat a friendly and enemy resource, neither player can discard cards and deal damage 4 to each ground unit', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['guerilla-insurgency'],
                        groundArena: ['wampa'],
                        resources: ['cunning', 'aggression', 'spark-of-rebellion', 'protector', 'atst', 'battlefield-marine', 'tieln-fighter', 'death-trooper', 'blood-sport', 'drop-in', 'hello-there'],
                    },
                    player2: {
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
                expect(context.player1).not.toHaveChooseNoTargetButton();

                // Each player defeats a resource
                context.player1.clickCard(context.cunning);

                expect(context.player2).toHavePrompt('Defeat a resource you control');
                expect(context.player2).toBeAbleToSelectExactly([context.confiscate, context.restock, context.breakingIn]);
                expect(context.player1).not.toHaveChooseNoTargetButton();
                context.player2.clickCard(context.confiscate);

                // Assert defeated resources
                expect(context.player1.resources.length).toBe(10);
                expect(context.player2.resources.length).toBe(2);

                expect(context.cunning).toBeInZone('discard', context.player1);
                expect(context.confiscate).toBeInZone('discard', context.player2);

                // Assert discarded cards
                expect(context.player2.hand.length).toBe(0);
                expect(context.player1.hand.length).toBe(0);

                // Assert dealt damage
                expect(context.wampa.damage).toBe(4);
                expect(context.seventhSister.damage).toBe(4);
                expect(context.corellianFreighter.damage).toBe(0); // Space unit should not be affected
            });
        });
    });
});
