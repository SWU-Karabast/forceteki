describe('Relentless Pursuit', function() {
    integration(function(contextRef) {
        describe('Relentless Pursuit\'s event ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['relentless-pursuit'],
                        groundArena: ['toro-calican#ambitious-upstart'],
                        spaceArena: ['avenger#hunting-star-destroyer'],
                    },
                    player2: {
                        groundArena: ['wampa', 'atst', 'battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
            });

            it('should allow a friendly unit to capture an enemy non-leader units that costs the same or less', () => {
                const { context } = contextRef;

                const reset = () => {
                    context.player1.moveCard(context.relentlessPursuit, 'hand');

                    context.player2.passAction();
                };

                // Scenario 1: A bounty hunter captures a unit
                context.player1.clickCard(context.relentlessPursuit);
                expect(context.player1).toBeAbleToSelectExactly([context.toroCalican, context.avenger]);

                context.player1.clickCard(context.toroCalican);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer]);

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeCapturedBy(context.toroCalican);
                expect(context.toroCalican).toHaveExactUpgradeNames(['shield']);

                reset();

                // Scenario 2: A non-bounty hunter captures a unit
                context.player1.clickCard(context.relentlessPursuit);
                expect(context.player1).toBeAbleToSelectExactly([context.toroCalican, context.avenger]);

                context.player1.clickCard(context.avenger);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa, context.cartelSpacer]);

                context.player1.clickCard(context.cartelSpacer);

                expect(context.player2).toBeActivePlayer();
                expect(context.cartelSpacer).toBeCapturedBy(context.avenger);
                expect(context.avenger).toHaveExactUpgradeNames([]);

                reset();

                // Scenario 3: A bounty hunter does not capture but gains a shield
                context.player1.clickCard(context.relentlessPursuit);
                expect(context.player1).toBeAbleToSelectExactly([context.toroCalican, context.avenger]);

                context.player1.clickCard(context.toroCalican);

                expect(context.player2).toBeActivePlayer();
                expect(context.toroCalican).toHaveExactUpgradeNames(['shield', 'shield']);

                reset();
            });
        });
    });
});
