describe('Overpower', function() {
    integration(function(contextRef) {
        describe('Overpower\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['overpower'],
                        groundArena: ['isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: 'asajj-ventress#unparalleled-adversary',
                        base: { card: 'echo-base', damage: 12 },
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['patrolling-vwing'],
                        base: { card: 'echo-base', damage: 3 }
                    }
                });
            });

            it('should give its own ground unit +3/+3 and overwhelm', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.overpower);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.battlefieldMarine, context.patrollingVwing, context.cartelSpacer]);
                context.player1.clickCard(context.isbAgent);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.isbAgent);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should give an enemy ground unit +3/+3 and overwhelm', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.overpower);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.battlefieldMarine, context.patrollingVwing, context.cartelSpacer]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.isbAgent);
                expect(context.p1Base.damage).toBe(15);
            });

            it('should give friendly space unit +3/+3 and overwhelm', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.overpower);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.battlefieldMarine, context.patrollingVwing, context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.patrollingVwing);
                expect(context.p2Base.damage).toBe(7);
            });

            it('should give enemy space unit +3/+3 and overwhelm', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.overpower);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.battlefieldMarine, context.patrollingVwing, context.cartelSpacer]);
                context.player1.clickCard(context.patrollingVwing);

                context.player2.clickCard(context.patrollingVwing);
                context.player2.clickCard(context.cartelSpacer);
                expect(context.p1Base.damage).toBe(13);
            });
        });
    });
});