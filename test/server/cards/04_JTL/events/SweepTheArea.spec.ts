describe('Sweep the Area', function() {
    integration(function(contextRef) {
        describe('Sweep the Area\'s ability', function () {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sweep-the-area'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['red-three#unstoppable'],
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['specforce-soldier', 'cantina-braggart', 'isb-agent']
                    }
                });
            });

            it('should return to hand up to 2 unit with a combined cost of 3 or less in the same arena (only 1 3-cost unit)', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.sweepTheArea);

                expect(context.player1).toBeAbleToSelectExactly([context.redThree, context.battlefieldMarine, context.greenSquadronAwing, context.specforceSoldier, context.cantinaBraggart, context.isbAgent]);
                expect(context.player1).toHaveChooseNoTargetButton();

                context.player1.clickCard(context.redThree);

                // red three chosen, cannot select more unit because combined cost is reached
                expect(context.player1).not.toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine, context.specforceSoldier, context.cantinaBraggart, context.isbAgent]);

                context.player1.clickPrompt('Done');
                expect(context.player2).toBeActivePlayer();
                expect(context.redThree).toBeInZone('hand', context.player1);
            });

            it('should return to hand up to 2 unit with a combined cost of 3 or less in the same arena (only 2 1-cost unit)', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.sweepTheArea);

                expect(context.player1).toBeAbleToSelectExactly([context.redThree, context.battlefieldMarine, context.greenSquadronAwing, context.specforceSoldier, context.cantinaBraggart, context.isbAgent]);
                expect(context.player1).toHaveChooseNoTargetButton();

                context.player1.clickCard(context.specforceSoldier);

                // SpecForce Soldier chosen, cannot select space unit
                expect(context.player1).not.toBeAbleToSelectExactly([context.redThree, context.greenSquadronAwing]);

                context.player1.clickCard(context.cantinaBraggart);

                // 2 unit selected, cannot select more
                expect(context.player1).not.toBeAbleToSelectExactly([context.redThree, context.battlefieldMarine, context.greenSquadronAwing, context.isbAgent]);

                context.player1.clickPrompt('Done');
                expect(context.player2).toBeActivePlayer();
                expect(context.specforceSoldier).toBeInZone('hand', context.player2);
                expect(context.cantinaBraggart).toBeInZone('hand', context.player2);
            });
        });
    });
});
