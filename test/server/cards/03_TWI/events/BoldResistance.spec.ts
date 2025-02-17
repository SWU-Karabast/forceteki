describe('Bold Resistance', function() {
    integration(function(contextRef) {
        describe('Bold Resistance\'s ability', function() {
            it('should apply +2/+0 for up to 3 units that share the same Trait this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bold-resistance', 'snowspeeder'],
                        discard: ['star-wing-scout'], // for confirming the zone selection is clean
                        spaceArena: ['green-squadron-awing', 'wing-leader', 'vanguard-ace'],
                        groundArena: ['specforce-soldier', 'wampa'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });
                const { context } = contextRef;

                // Everything is selectable -- except the discard piles / hands
                context.player1.clickCard(context.boldResistance);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.specforceSoldier, context.wingLeader, context.wampa, context.atst, context.vanguardAce]);

                // Wampa is out, ATST is still in because its a vehicle
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.specforceSoldier, context.wingLeader, context.atst, context.vanguardAce]);

                // Now the only trait should be 'rebel' - no ATST nor vanguard ace
                context.player1.clickCard(context.specforceSoldier);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.specforceSoldier, context.wingLeader]);

                // test unselect
                context.player1.clickCard(context.specforceSoldier);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.specforceSoldier, context.wingLeader, context.atst, context.vanguardAce]);

                // Now the common trait should be 'vehicle'
                context.player1.clickCard(context.vanguardAce);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wingLeader, context.atst, context.vanguardAce]);

                // Select the 3rd unit
                context.player1.clickCard(context.wingLeader);
                context.player1.clickPrompt('Done');
                expect(context.greenSquadronAwing.getPower()).toBe(3);
                expect(context.vanguardAce.getPower()).toBe(3);
                expect(context.wingLeader.getPower()).toBe(4);

                // Reset
                context.player2.passAction();
                context.player1.moveCard(context.boldResistance, 'hand');

                // Making sure the reset worked
                context.player1.clickCard(context.boldResistance);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.specforceSoldier, context.wingLeader, context.wampa, context.atst, context.vanguardAce]);

                // Wampa has no overlap with other card traits - only wampa is still selectable
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

                // test unselect
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.specforceSoldier, context.wingLeader, context.wampa, context.atst, context.vanguardAce]);

                // test opponent card select -- and this is matching vehicle trait and should still boost its attack after clicking Done
                context.player1.clickCard(context.atst);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wingLeader, context.atst, context.vanguardAce]);
                context.player1.clickPrompt('Done');
                expect(context.atst.getPower()).toBe(8);

                // Reset
                context.player2.passAction();
                context.player1.moveCard(context.boldResistance, 'hand');

                context.moveToNextActionPhase();

                // All the +2/0 should have faded now that its a new action phase
                expect(context.greenSquadronAwing.getPower()).toBe(1);
                expect(context.vanguardAce.getPower()).toBe(1);
                expect(context.wingLeader.getPower()).toBe(2);
                expect(context.atst.getPower()).toBe(6);
            });
        });
    });
});
