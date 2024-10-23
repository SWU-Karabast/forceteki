describe('Chewbacca, Walking Carpet', function() {
    integration(function(contextRef) {
        describe('Chewbacca, Walking Carpet\'s undeployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['alliance-xwing', 'liberated-slaves', 'seventh-fleet-defender', 'consular-security-force'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'administrators-tower'
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('should let the controller play a unit with printed cost 3 or less and give it sentinel for the phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                expect(context.player1).toHaveEnabledPromptButtons(['Play a unit that costs 3 or less. It gains sentinel for this phase', 'Deploy Chewbacca']);

                context.player1.clickPrompt('Play a unit that costs 3 or less. It gains sentinel for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.liberatedSlaves, context.seventhFleetDefender]);

                context.player1.clickCard(context.liberatedSlaves);
                expect(context.player1.countExhaustedResources()).toBe(3);

                // player 2 attacks, liberated slaves automatically selected due to sentinel
                context.player2.clickCard(context.wampa);
                expect(context.player1).toBeActivePlayer();
                expect(context.liberatedSlaves.damage).toBe(4);
                expect(context.wampa.damage).toBe(3);

                // next round, liberated slaves should no longer have sentinel
                context.moveToNextActionPhase();
                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                expect(this.player2).toBeAbleToSelectExactly([context.p1Base, context.liberatedSlaves]);
            });

            it('should not affect the cost of playing a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play a unit that costs 3 or less. It gains sentinel for this phase');
                context.player1.clickCard(context.seventhFleetDefender);
                expect(context.player1.countExhaustedResources()).toBe(5);

                // test sentinel gain again for good measure
                context.player2.clickCard(context.tielnFighter);
                expect(context.tielnFighter).toBeInLocation('discard');
            });
        });
    });
});
