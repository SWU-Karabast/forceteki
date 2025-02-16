describe('L3-37, Droid Revolutionary ability', function() {
    integration(function(contextRef) {
        describe('L3-37, Droid Revolutionary\'s when played ability', function() {
            it('rescue a unit and no shield given', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['take-captive'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        spaceArena: ['wing-leader'],
                        hand: ['l337#droid-revolutionary']
                    }
                });

                const { context } = contextRef;

                // SETUP: P1 Captures Wing Leader with Tie/LN
                context.player1.clickCard(context.takeCaptive);
                context.player1.clickCard(context.tielnFighter);
                context.player1.clickCard(context.wingLeader);
                expect(context.wingLeader).toBeCapturedBy(context.tielnFighter);

                // P2 Rescues Wing Leader with L3-37
                context.player2.clickCard(context.l337DroidRevolutionary);
                expect(context.player2).toBeAbleToSelectExactly([context.wingLeader]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.wingLeader);
                expect(context.wingLeader).toBeInZone('spaceArena');
                expect(context.l337DroidRevolutionary.isUpgraded()).toBeFalse(); // no shield
            });

            it('does not rescue a unit and is shielded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['take-captive'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        spaceArena: ['wing-leader'],
                        hand: ['l337#droid-revolutionary']
                    }
                });

                const { context } = contextRef;

                // SETUP: P1 Captures Wing Leader with Tie/LN
                context.player1.clickCard(context.takeCaptive);
                context.player1.clickCard(context.tielnFighter);
                context.player1.clickCard(context.wingLeader);

                expect(context.wingLeader).toBeCapturedBy(context.tielnFighter);

                context.player2.clickCard(context.l337DroidRevolutionary);
                expect(context.player2).toBeAbleToSelectExactly([context.wingLeader]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickPrompt('Pass');

                expect(context.wingLeader).toBeCapturedBy(context.tielnFighter);
                expect(context.player1).toBeActivePlayer();
                expect(context.l337DroidRevolutionary).toHaveExactUpgradeNames(['shield']);
            });

            it('does not rescue a unit as there is no captured units and is shielded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['l337#droid-revolutionary']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.l337DroidRevolutionary);

                expect(context.player2).toBeActivePlayer();
                expect(context.l337DroidRevolutionary).toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});
