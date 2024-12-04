describe('Rule With Respect', function() {
    integration(function(contextRef) {
        describe('Rule With Respect\'s event ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['rule-with-respect', 'battlefield-marine', 'death-star-stormtrooper', 'tieln-fighter'],
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
            });

            it('should allow a friendly unit to capture all enemy non-leader units that attacked your base this phase', () => {
                const { context } = contextRef;

                const reset = () => {
                    context.player1.moveCard(context.ruleWithRespect, 'hand');

                    context.moveToNextActionPhase();
                };

                // Scenario 1: No units available to capture
                context.player1.passAction();
                context.player2.clickCard(context.cartelSpacer);

                context.player1.clickCard(context.ruleWithRespect);

                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();
                context.player1.clickCard(context.deathStarStormtrooper);
                context.player2.passAction();
                context.player1.clickCard(context.tielnFighter);

                reset();

                // Scenario 2: No units attacked the base
                context.player1.clickCard(context.ruleWithRespect);

                expect(context.player2).toBeActivePlayer();

                reset();

                // Scenario 3: Capture all units that attacked the base
                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                context.player1.passAction();
                context.player2.clickCard(context.cartelSpacer);
                context.player2.clickCard(context.p1Base);

                context.player1.passAction();
                context.player2.clickCard(context.bobaFett);
                context.player2.clickCard(context.p1Base);

                context.player1.passAction();
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.deathStarStormtrooper);

                context.player1.clickCard(context.ruleWithRespect);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.tielnFighter]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeCapturedBy(context.battlefieldMarine);
                expect(context.cartelSpacer).toBeCapturedBy(context.battlefieldMarine);
                expect(context.bobaFett).not.toBeCapturedBy(context.battlefieldMarine);
                expect(context.atst).not.toBeCapturedBy(context.battlefieldMarine);
            });
        });
    });
});
