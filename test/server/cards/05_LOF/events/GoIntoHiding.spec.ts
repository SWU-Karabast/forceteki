describe('Go Into Hiding', function() {
    integration(function(contextRef) {
        describe('Go Into Hiding\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['go-into-hiding', 'guarding-the-way'],
                        groundArena: ['isb-agent'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['patrolling-vwing'],
                    }
                });
            });

            it('should prevent own unit from being attacked', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.goIntoHiding);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.battlefieldMarine, context.patrollingVwing, context.cartelSpacer]);
                context.player1.clickCard(context.isbAgent);

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });

            it('should prevent enemy unit from being attacked', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.goIntoHiding);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.battlefieldMarine, context.patrollingVwing, context.cartelSpacer]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.isbAgent);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
                context.player1.clickCard(context.p2Base);

                context.moveToNextActionPhase();
                context.player1.clickCard(context.isbAgent);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.p2Base]);
                context.player1.clickCard(context.p2Base);
            });

            it('should not prevent attack if unit gains sentinel', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.goIntoHiding);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.battlefieldMarine, context.patrollingVwing, context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.guardingTheWay);
                context.player1.clickCard(context.cartelSpacer);
                context.player2.clickCard(context.patrollingVwing);
                expect(context.player2).toBeAbleToSelectExactly(context.cartelSpacer);
                context.player2.clickCard(context.cartelSpacer);
            });
        });
    });
});