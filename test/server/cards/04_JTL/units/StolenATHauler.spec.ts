describe('Stolen AT-Hauler', () => {
    integration(function(contextRef) {
        describe('Stolen AT-Hauler\'s when-defeated ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        hand: ['takedown'],
                        spaceArena: ['stolen-athauler'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['takedown', 'no-glory-only-results'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;
                context.p1Takedown = context.player1.findCardByName('takedown');
                context.p2Takedown = context.player2.findCardByName('takedown');
            });

            it('for this round, it allows the opponent to play it from its owner\'s discard pile for free', function() {
                const { context } = contextRef;

                // Defeat the Stolen AT-Hauler
                context.player2.clickCard(context.p2Takedown);
                context.player2.clickCard(context.stolenAthauler);

                // It should be in Player 1's discard pile
                expect(context.stolenAthauler).toBeInZone('discard', context.player1);

                // Player 1 cannot play it from discarde
                expect(context.player1).not.toBeAbleToSelect(context.stolenAthauler);
                expect(context.stolenAthauler).not.toHaveAvailableActionWhenClickedBy(context.player1);
                context.player1.passAction();

                // Player 2 can play it from discard for free
                const p2ReadyResources = context.player2.readyResourceCount;
                expect(context.player2).toBeAbleToSelect(context.stolenAthauler);
                expect(context.stolenAthauler).toHaveAvailableActionWhenClickedBy(context.player2);
                expect(context.stolenAthauler).toBeInZone('spaceArena', context.player2);

                // Resource count didn't change
                expect(context.player2.readyResourceCount).toBe(p2ReadyResources);
            });

            it('can be cylcled if it is played and defeated multiple times in the same round', function() {
                const { context } = contextRef;

                // Defeat the Stolen AT-Hauler
                context.player2.clickCard(context.p2Takedown);
                context.player2.clickCard(context.stolenAthauler);

                // It should be in Player 1's discard pile
                expect(context.stolenAthauler).toBeInZone('discard', context.player1);

                // Player 1 cannot play it from discard
                expect(context.player1).not.toBeAbleToSelect(context.stolenAthauler);
                expect(context.stolenAthauler).not.toHaveAvailableActionWhenClickedBy(context.player1);
                context.player1.passAction();

                // Player 2 can play it from discard for free
                const p2ReadyResources = context.player2.readyResourceCount;
                expect(context.player2).toBeAbleToSelect(context.stolenAthauler);
                expect(context.stolenAthauler).toHaveAvailableActionWhenClickedBy(context.player2);
                expect(context.stolenAthauler).toBeInZone('spaceArena', context.player2);

                // Resource count didn't change
                expect(context.player2.readyResourceCount).toBe(p2ReadyResources);

                // Defeat the Stolen AT-Hauler again
                context.player1.clickCard(context.p1Takedown);
                context.player1.clickCard(context.stolenAthauler);

                // It should be in Player 1's discard pile
                expect(context.stolenAthauler).toBeInZone('discard', context.player1);

                // Player 2 cannot play it from discard
                expect(context.player2).not.toBeAbleToSelect(context.stolenAthauler);
                expect(context.stolenAthauler).not.toHaveAvailableActionWhenClickedBy(context.player2);
                context.player2.passAction();

                // Player 1 can play it from discard for free
                const p1ReadyResources = context.player1.readyResourceCount;
                expect(context.player1).toBeAbleToSelect(context.stolenAthauler);
                expect(context.stolenAthauler).toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);

                // Resource count didn't change
                expect(context.player1.readyResourceCount).toBe(p1ReadyResources);
            });

            it('does not allow the opponent to play it if the round has passed', function() {
                const { context } = contextRef;

                // Defeat the Stolen AT-Hauler
                context.player2.clickCard(context.p2Takedown);
                context.player2.clickCard(context.stolenAthauler);

                context.moveToNextActionPhase();

                // Player 2 cannot play it from discard
                expect(context.player2).not.toBeAbleToSelect(context.stolenAthauler);
                expect(context.stolenAthauler).not.toHaveAvailableActionWhenClickedBy(context.player2);
                context.player2.passAction();

                // Player 1 cannot play it from discard
                expect(context.player1).not.toBeAbleToSelect(context.stolenAthauler);
                expect(context.stolenAthauler).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('cannot be played from discard if its abilities were blanked before it was defeated', function() {
                const { context } = contextRef;

                context.player2.passAction();

                // Blank the Stolen AT-Hauler
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.stolenAthauler);
                context.player1.passAction();

                // Defeat the Stolen AT-Hauler
                context.player2.clickCard(context.p2Takedown);
                context.player2.clickCard(context.stolenAthauler);

                // It should be in Player 1's discard pile
                expect(context.stolenAthauler).toBeInZone('discard', context.player1);

                // Player 1 cannot play it from discard
                expect(context.player1).not.toBeAbleToSelect(context.stolenAthauler);
                expect(context.stolenAthauler).not.toHaveAvailableActionWhenClickedBy(context.player1);
                context.player1.passAction();

                // Player 2 cannot play it from discard
                expect(context.player2).not.toBeAbleToSelect(context.stolenAthauler);
                expect(context.stolenAthauler).not.toHaveAvailableActionWhenClickedBy(context.player2);
            });

            it('works as expected if the unit changes controller before it is defeated', function() {
                const { context } = contextRef;

                // Play No Glory to change control of the Stolen AT-Hauler before it is defeated
                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.stolenAthauler);

                // It should be in Player 1's discard pile
                expect(context.stolenAthauler).toBeInZone('discard', context.player1);

                // (P1 take an action)
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Player 2 cannot play it from discard
                expect(context.player2).not.toBeAbleToSelect(context.stolenAthauler);
                expect(context.stolenAthauler).not.toHaveAvailableActionWhenClickedBy(context.player2);
                context.player2.passAction();

                // Player 1 can play it from discard for free
                const p1ReadyResources = context.player1.readyResourceCount;
                expect(context.player1).toBeAbleToSelect(context.stolenAthauler);
                expect(context.stolenAthauler).toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);

                // Resource count didn't change
                expect(context.player1.readyResourceCount).toBe(p1ReadyResources);
            });
        });
    });
});