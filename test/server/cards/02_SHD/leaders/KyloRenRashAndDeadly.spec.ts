describe('Kylo Ren, Rash And Deadly', function() {
    integration(function(contextRef) {
        describe('Kylo Ren\'s leader undeployed ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['waylay', 'protector'],
                        deck: [], // prevent card draw to empty hand
                        groundArena: ['death-star-stormtrooper'],
                        leader: 'kylo-ren#rash-and-deadly',
                    },
                    player2: {
                        groundArena: ['moisture-farmer']
                    },
                });
            });

            it('should discard a card from hand and give a unit +2/0 for this phase', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.kyloRenRashAndDeadly);
                context.player1.clickPrompt('Discard a card from your hand, give a unit +2/+0 for this phase');
                context.player1.clickCard(context.deathStarStormtrooper); // selection first
                expect(context.player1).toBeAbleToSelectExactly([context.waylay, context.protector]);
                context.player1.clickPrompt('Cancel');

                // Cancelled -- no change here!
                expect(context.kyloRenRashAndDeadly.exhausted).toBe(false);
                expect(context.deathStarStormtrooper.getPower()).toBe(3);

                context.player1.clickCard(context.kyloRenRashAndDeadly);
                context.player1.clickPrompt('Discard a card from your hand, give a unit +2/+0 for this phase');
                context.player1.clickCard(context.deathStarStormtrooper); // selection first
                expect(context.player1).toBeAbleToSelectExactly([context.waylay, context.protector]);
                context.player1.clickCard(context.waylay); // discard cost second

                expect(context.kyloRenRashAndDeadly.exhausted).toBe(true);
                expect(context.deathStarStormtrooper.getPower()).toBe(5);

                context.player2.passAction();

                // Disable ability to be deployed
                context.player1.setResourceCount(3);

                // Kylo is exhausted, and deploy disabled, there should be no available action
                expect(context.kyloRenRashAndDeadly).not.toHaveAvailableActionWhenClickedBy(context.player1);

                // Restore the resources
                context.player1.setResourceCount(20);

                context.moveToNextActionPhase();

                // Test the stat modifier wore off with the phase transition
                expect(context.deathStarStormtrooper.getPower()).toBe(3);

                // Testing a single card in hand
                context.player1.clickCard(context.kyloRenRashAndDeadly);
                context.player1.clickPrompt('Discard a card from your hand, give a unit +2/+0 for this phase');
                context.player1.clickCard(context.deathStarStormtrooper); // selection first
                expect(context.player1).toBeAbleToSelectExactly([context.protector]);
                context.player1.clickCard(context.protector); // still have to hand-select card, doesn't auto resolve

                expect(context.kyloRenRashAndDeadly.exhausted).toBe(true);
                expect(context.deathStarStormtrooper.getPower()).toBe(5);
                expect(context.protector).toBeInZone('discard');

                context.moveToNextActionPhase();

                // Test the stat modifier wore off with the phase transition (again)
                expect(context.deathStarStormtrooper.getPower()).toBe(3);

                // Disable ability to be deployed
                context.player1.setResourceCount(3);

                // Kylo isn't exhausted, but there is nothing to discard -- there should be no available action when clicked
                expect(context.kyloRenRashAndDeadly.exhausted).toBe(false);
                expect(context.kyloRenRashAndDeadly).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });

        describe('Kylo Ren\'s leader deployed ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['death-star-stormtrooper', 'scout-bike-pursuer', 'tieln-fighter', 'seasoned-shoretrooper', 'partisan-insurgent', 'surprise-strike'],
                        leader: { card: 'kylo-ren#rash-and-deadly', deployed: true },
                    },
                    player2: {
                        groundArena: ['moisture-farmer', 'moisture-farmer', 'moisture-farmer', 'moisture-farmer']
                    },
                });
            });

            it('should give Kylo -1/-0 for each card in hand', function() {
                const { context } = contextRef;

                const moistureFarmer1 = context.player2.groundArena[0];
                const moistureFarmer2 = context.player2.groundArena[1];
                const moistureFarmer3 = context.player2.groundArena[2];
                const moistureFarmer4 = context.player2.groundArena[3];

                context.player1.passAction();

                // First test that 6 cards works ok, and that it's 0 damage and not -1
                context.player2.clickCard(moistureFarmer1);
                expect(context.player2).toBeAbleToSelectExactly([context.kyloRenRashAndDeadly, context.p1Base]);
                context.player2.clickCard(context.kyloRenRashAndDeadly);
                expect(context.kyloRenRashAndDeadly.getPower()).toBe(0);
                expect(moistureFarmer1.damage).toBe(0);

                context.player1.clickCard(context.deathStarStormtrooper);

                // 5 cards in hand - still 0
                context.player2.clickCard(moistureFarmer2);
                context.player2.clickCard(context.kyloRenRashAndDeadly);

                expect(context.kyloRenRashAndDeadly.getPower()).toBe(0);
                expect(moistureFarmer2.damage).toBe(0);

                context.player1.clickCard(context.scoutBikePursuer);
                context.player2.passAction();

                context.player1.clickCard(context.tielnFighter);

                // 3 cards left in hand Kylo should be 2/4
                context.player2.clickCard(moistureFarmer3);
                context.player2.clickCard(context.kyloRenRashAndDeadly);
                expect(context.kyloRenRashAndDeadly.getPower()).toBe(2);
                expect(moistureFarmer3.damage).toBe(2);

                context.player1.clickCard(context.seasonedShoretrooper);
                context.player2.passAction();

                context.player1.clickCard(context.partisanInsurgent);

                // 1 cards left in hand Kylo should be 4/4
                context.player2.clickCard(moistureFarmer4);
                context.player2.clickCard(context.kyloRenRashAndDeadly);
                expect(context.kyloRenRashAndDeadly.getPower()).toBe(4);
                expect(moistureFarmer4).toBeInZone('discard'); // took 4 damage and was defeated

                // Now lets test suprise strike taking the hand to size 0 and attack the base
                // Checking timing of the card leaving play and that kylo's modify ticked up
                context.player1.clickCard(context.surpriseStrike);
                context.player1.clickCard(context.kyloRenRashAndDeadly);
                context.player1.clickCard(context.p2Base);
                expect(context.kyloRenRashAndDeadly.getPower()).toBe(5); // should be 5 power after hand is cleared
                expect(context.p2Base.damage).toBe(8); // suprise strike and 5 power
            });
        });
    });
});
