describe('Hondo Ohnaka, Plays By His Own Rules', function() {
    integration(function(contextRef) {
        describe('Hondo Ohnaka\'s constant ability', function() {
            it('allows Hondo\'s controller to see the top card of their deck at any time', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hondo-ohnaka#plays-by-his-own-rules'],
                        deck: ['vanquish'],
                    },
                    player2: {
                        deck: ['overwhelming-barrage'],
                    }
                });

                const { context } = contextRef;

                expect(context.player1).not.toSeeTopCardOfDeck();

                context.player1.clickCard(context.hondoOhnaka);

                expect(context.hondoOhnaka).toBeInZone('groundArena', context.player1);
                expect(context.player1).toSeeTopCardOfDeck(); // Can see their own top card
                expect(context.player1).not.toSeeTopCardOfDeck(context.player2); // Cannot see P2's top card
                expect(context.player2).not.toSeeTopCardOfDeck(); // Cannot see their own top card
                expect(context.player2).not.toSeeTopCardOfDeck(context.player1); // Cannot see P1's top card
            });

            it('an opponent can see their top card if Hondo is stolen', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hondo-ohnaka#plays-by-his-own-rules'],
                        deck: ['vanquish'],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['change-of-heart'],
                        deck: ['overwhelming-barrage'],
                    }
                });

                const { context } = contextRef;

                // P1 can see their top card
                expect(context.player1).toSeeTopCardOfDeck();

                // P2 plays Change of Heart to steal Hondo
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.hondoOhnaka);

                // Now P2 can see their top card
                expect(context.player2).toSeeTopCardOfDeck();
                expect(context.player1).not.toSeeTopCardOfDeck(); // P1 can no longer see their top card
            });

            it('stops working when Hondo\'s abilities get removed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        groundArena: ['hondo-ohnaka#plays-by-his-own-rules'],
                        deck: ['vanquish', 'resupply', 'restock'],
                    }
                });

                const { context } = contextRef;

                // P1 can see their top card
                expect(context.player1).toSeeTopCardOfDeck();

                // P1 uses Kaz's ability to remove Hondo's abilities until the following round
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Remove all abilities from a friendly unit, then take another action');
                context.player1.clickCard(context.hondoOhnaka);
                context.player1.passAction(); // Additional action granted by Kaz

                // Hondo's abilities are removed, so P1 can no longer see their top card
                expect(context.player1).not.toSeeTopCardOfDeck();

                // Move to next round
                context.moveToNextActionPhase();

                // Hondo's abilities are back, so P1 can see their top card again
                expect(context.player1).toSeeTopCardOfDeck();
            });

            it('Hondo\'s controller cannot see the top card of their deck if their deck is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hondo-ohnaka#plays-by-his-own-rules'],
                        deck: [],
                    }
                });

                const { context } = contextRef;

                // P1 cannot see their top card as their deck is empty
                expect(context.player1).not.toSeeTopCardOfDeck();
            });
        });

        describe('Hondo Ohnaka\'s action ability', function() {
            it('allows Hondo\'s controller to play the top card of their deck (paying its costs)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        groundArena: ['hondo-ohnaka#plays-by-his-own-rules'],
                        deck: ['vanquish']
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                    }
                });

                const { context } = contextRef;

                // Use the action ability to play Vanquish from the top of the deck
                context.player1.clickCard(context.hondoOhnaka);
                context.player1.clickPrompt('Play the top card of your deck');

                // Target the opponent's unit with Vanquish
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.vanquish).toBeInZone('discard', context.player1);
                expect(context.consularSecurityForce).toBeInZone('discard', context.player2);
                expect(context.player1.exhaustedResourceCount).toEqual(5); // Paid the cost
            });

            it('can only be used once per round', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hondo-ohnaka#plays-by-his-own-rules'],
                        deck: ['devotion', 'atst', 'atst', 'resupply']
                    }
                });

                const { context } = contextRef;

                // Use the action ability to play Devotion from the top of the deck
                context.player1.clickCard(context.hondoOhnaka);
                context.player1.clickPrompt('Play the top card of your deck');
                context.player1.clickCard(context.hondoOhnaka); // Target Hondo with Devotion

                expect(context.hondoOhnaka).toHaveExactUpgradeNames(['devotion']);

                context.player2.passAction();

                // Selecting Hondo again goes straight to attack action
                context.player1.clickCard(context.hondoOhnaka);
                expect(context.player1).toHavePrompt('Choose a target for attack');
                context.player1.clickCard(context.p2Base);

                context.moveToNextActionPhase();

                // Use the action ability to play Resupply from the top of the deck
                context.player1.clickCard(context.hondoOhnaka);
                context.player1.clickPrompt('Play the top card of your deck');

                expect(context.resupply).toBeInZone('resource', context.player1);
            });

            it('can be used once per round by each player', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hondo-ohnaka#plays-by-his-own-rules'],
                        deck: ['devotion']
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        deck: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // P1 uses Hondo's action ability to play Devotion from the top of their deck
                context.player1.clickCard(context.hondoOhnaka);
                context.player1.clickPrompt('Play the top card of your deck');
                context.player1.clickCard(context.hondoOhnaka); // Target Hondo with Devotion

                expect(context.hondoOhnaka).toHaveExactUpgradeNames(['devotion']);

                // P2 plays Change of Heart to steal Hondo
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.hondoOhnaka);

                context.player1.passAction();

                // P2 uses Hondo's action ability to play Battlefield Marine from the top of their deck
                context.player2.clickCard(context.hondoOhnaka);
                context.player2.clickPrompt('Play the top card of your deck');
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
            });

            it('cannot be used if the controller\'s deck is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'hondo-ohnaka#plays-by-his-own-rules', exhausted: true }
                        ],
                        deck: []
                    }
                });

                const { context } = contextRef;

                // Hondo's action ability cannot be used as P1's deck is empty
                expect(context.player1).not.toBeAbleToSelect(context.hondoOhnaka);
            });

            it('cannot be used if the player cannot pay the costs to play the top card of their deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        resources: 5,
                        groundArena: [
                            { card: 'hondo-ohnaka#plays-by-his-own-rules', exhausted: true }
                        ],
                        deck: ['atst']
                    }
                });

                const { context } = contextRef;

                // Hondo's action ability cannot be used as P1 cannot pay the cost to play AT-ST
                expect(context.player1).not.toBeAbleToSelect(context.hondoOhnaka);
            });

            it('cannot be used if the player is restricted from playing the top card of their deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hondo-ohnaka#plays-by-his-own-rules'],
                        deck: ['vanquish'],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['regional-governor'],
                    }
                });

                const { context } = contextRef;

                // P2 plays Regional Governor and names Vanquish
                context.player2.clickCard(context.regionalGovernor);
                context.player2.chooseListOption('Vanquish');

                // P1 click Hondo but the only available action is to attack
                context.player1.clickCard(context.hondoOhnaka);
                expect(context.player1).toHavePrompt('Choose a target for attack');
                context.player1.clickCard(context.p2Base);
            });
        });
    });
});